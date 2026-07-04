// ============================================
// AI SERVICE — live, multi-provider GenAI integration
//
// Every exported function here makes a real network call to a live LLM API.
// Primary provider is Gemini (supports direct browser calls). If Gemini is
// unavailable — rate-limited, overloaded (503), or briefly down — the same
// request automatically retries with backoff, then falls back to a second
// Gemini model, then (if configured) to Groq as an independent provider.
//
// There is no canned/fallback text anywhere in this file: every exported
// function returns { ok: true, ... } only when a real model actually
// produced the content, or { ok: false, error } otherwise. Callers must
// render a genuine error state on failure rather than substituting static
// copy and labeling it "AI-generated".
// ============================================

// Read lazily (never cached into a module-level const) so that: (a) tests can
// reliably stub env vars per-case with vi.stubEnv, and (b) if Vite's dev
// server reloads env after a .env edit, the running module picks it up.
function getGeminiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY;
}
function getGroqKey() {
  return import.meta.env.VITE_GROQ_API_KEY;
}

const GEMINI_URL = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
const GEMINI_PRIMARY_MODEL = 'gemini-2.5-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-2.0-flash';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const RETRYABLE_STATUS = new Set([429, 500, 503, 504]);
const REQUEST_TIMEOUT_MS = 20000;

function isConfigured(key) {
  return Boolean(key) && !key.startsWith('your_');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** One raw call to a single Gemini model. Never retries internally. */
async function callGeminiOnce(model, prompt, generationConfig) {
  const response = await fetchWithTimeout(`${GEMINI_URL(model)}?key=${getGeminiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 900, topP: 0.95, topK: 40, ...generationConfig },
    }),
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body?.error?.message || message;
    } catch {
      /* no JSON body */
    }
    return { ok: false, status: response.status, error: `Gemini (${model}) error ${response.status}: ${message}` };
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const blockReason = data?.promptFeedback?.blockReason;

  if (blockReason) return { ok: false, status: 200, error: `Gemini blocked the request: ${blockReason}` };
  if (!text) return { ok: false, status: 200, error: `Gemini (${model}) returned an empty response.` };
  return { ok: true, text: text.trim() };
}

/**
 * Calls Gemini with automatic retry-with-backoff on transient errors
 * (429/500/503/504), then falls back to a second Gemini model if the
 * primary is still unavailable after retries.
 */
async function callGeminiResilient(prompt, generationConfig) {
  const attempts = [
    { model: GEMINI_PRIMARY_MODEL, delay: 0 },
    { model: GEMINI_PRIMARY_MODEL, delay: 800 },
    { model: GEMINI_FALLBACK_MODEL, delay: 0 },
    { model: GEMINI_FALLBACK_MODEL, delay: 1200 },
  ];

  let lastError = { ok: false, error: 'Gemini is not configured.' };
  for (const attempt of attempts) {
    if (attempt.delay) await sleep(attempt.delay);
    const result = await callGeminiOnce(attempt.model, prompt, generationConfig);
    if (result.ok) return result;
    lastError = result;
    if (!RETRYABLE_STATUS.has(result.status)) break; // non-transient error, stop retrying Gemini
  }
  return lastError;
}

/** One raw call to Groq's OpenAI-compatible chat completions endpoint. */
async function callGroqOnce(prompt, { temperature = 0.85, maxOutputTokens = 900, json = false } = {}) {
  const response = await fetchWithTimeout(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getGroqKey()}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxOutputTokens,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body?.error?.message || message;
    } catch {
      /* no JSON body */
    }
    return { ok: false, status: response.status, error: `Groq error ${response.status}: ${message}` };
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) return { ok: false, status: 200, error: 'Groq returned an empty response.' };
  return { ok: true, text: text.trim() };
}

/**
 * Public entry point used by every generate/insight function below.
 * Tries Gemini (with its own retry + model fallback) first; if that's
 * ultimately unavailable and a Groq key is configured, tries Groq once.
 * `json` requests structured JSON output using each provider's native mode.
 */
async function callAI(prompt, { temperature, maxOutputTokens, json = false } = {}) {
  const geminiConfigured = isConfigured(getGeminiKey());
  const groqConfigured = isConfigured(getGroqKey());

  if (geminiConfigured) {
    const geminiConfig = { temperature, maxOutputTokens, ...(json ? { responseMimeType: 'application/json' } : {}) };
    const geminiResult = await callGeminiResilient(prompt, geminiConfig);
    if (geminiResult.ok) return geminiResult;

    if (groqConfigured) {
      const groqResult = await callGroqOnce(prompt, { temperature, maxOutputTokens, json });
      if (groqResult.ok) return groqResult;
      return { ok: false, error: `${geminiResult.error} — fallback also failed: ${groqResult.error}` };
    }
    return geminiResult;
  }

  if (groqConfigured) {
    return callGroqOnce(prompt, { temperature, maxOutputTokens, json });
  }

  return { ok: false, error: noProviderConfiguredMessage() };
}

/**
 * Vite inlines `import.meta.env.VITE_*` values at BUILD time. A `.env` file
 * only helps `npm run dev`/`npm run build` on your own machine — it is
 * git-ignored and never reaches a deployed host. If this app is deployed
 * (Vercel, Netlify, GitHub Pages, etc.) without the same variables added in
 * that platform's own dashboard, the shipped bundle simply has no key baked
 * in, and every AI call fails with "no provider configured" even though the
 * developer's local .env is correct. `import.meta.env.PROD` tells us which
 * message actually helps the person seeing it.
 */
function noProviderConfiguredMessage() {
  if (import.meta.env.PROD) {
    return (
      'No AI provider configured on this deployment. A .env file never reaches a deployed host — ' +
      'add VITE_GEMINI_API_KEY (and optionally VITE_GROQ_API_KEY) as Environment Variables in your ' +
      "hosting provider's project settings (e.g. Vercel: Project → Settings → Environment Variables; " +
      'Netlify: Site configuration → Environment variables), then trigger a new deploy — the keys are ' +
      'baked in at build time, so editing them alone without redeploying will not fix it.'
    );
  }
  return 'No AI provider configured. Add VITE_GEMINI_API_KEY and/or VITE_GROQ_API_KEY to .env and restart the dev server.';
}

function extractJson(text) {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

/** Generate a personalized cultural travel story. Returns {ok, story|error}. */
export async function generateCulturalStory({ mood, interests, destination, travelerName = 'traveler' }) {
  const prompt = `You are Ghumlo, an AI travel companion that writes deeply personal, emotionally resonant cultural narratives for travelers exploring India's heritage.

Write a vivid, immersive travel story (200-250 words) for a traveler named ${travelerName} who is feeling ${mood} and passionate about: ${interests.join(', ')}.
The story is set in ${destination.name}, ${destination.state}.

Requirements:
- Open with a sensory detail (smell, sound, texture) that transports the reader immediately.
- Feature a real-feeling interaction with a local artisan, elder, or keeper (invented but plausible Indian name and role).
- Reference a specific, lesser-known aspect of ${destination.name}.
- Weave in one element of this region's intangible heritage: ${destination.intangibleHeritage.join(', ')}.
- Match the traveler's ${mood} mood emotionally.
- End with a moment of cultural revelation, not a neat conclusion.
- Avoid travel-brochure clichés like "land of contrasts" or "incredible India".

Write the story now, as plain prose (no markdown headers).`;

  const result = await callAI(prompt, { temperature: 0.9, maxOutputTokens: 900 });
  return result.ok ? { ok: true, story: result.text } : result;
}

/** Generate 3 personalized hidden-gem suggestions as structured JSON. */
export async function generateHiddenGems({ mood, interests, destination }) {
  const prompt = `You are Ghumlo, an expert in Indian heritage and off-the-beaten-path cultural experiences.

A traveler is feeling ${mood} and loves: ${interests.join(', ')}. Suggest exactly 3 specific hidden gems in ${destination.name}, ${destination.state} that are NOT typical tourist spots.

Return ONLY a JSON array, no markdown fences, no commentary, in this exact shape:
[
  {
    "name": "short name of the place or experience",
    "significance": "1-2 sentences on why it matters culturally",
    "localContact": { "name": "plausible Indian name", "role": "their role" },
    "bestTime": "best time of day or season to visit",
    "sensoryDetail": "one vivid sensory detail"
  }
]`;

  const result = await callAI(prompt, { temperature: 0.8, maxOutputTokens: 700, json: true });
  if (!result.ok) return result;

  try {
    return { ok: true, gems: extractJson(result.text) };
  } catch {
    return { ok: false, error: 'The model returned malformed JSON for hidden gems.' };
  }
}

/** Generate a multi-day itinerary as structured JSON. */
export async function generateItinerary({ destination, days = 3, interests, mood }) {
  const realEvents = destination.events.filter((e) => e.isReal).map((e) => e.title).join(', ');
  const prompt = `Create a ${days}-day culturally immersive itinerary for ${destination.name}, ${destination.state}.

Traveler profile: feeling ${mood}, interested in ${interests.join(', ')}.
Known local cuisine to weave in: ${destination.cuisine.join(', ')}.
Known real events, if relevant to the dates: ${realEvents || 'none specified'}.

Return ONLY JSON, no markdown fences, in this exact shape:
{
  "days": [
    {
      "day": 1,
      "theme": "short theme for the day",
      "morning": { "activity": "...", "location": "...", "tip": "..." },
      "afternoon": { "activity": "...", "location": "...", "tip": "..." },
      "evening": { "activity": "...", "location": "...", "tip": "..." },
      "food": ["dish 1", "dish 2"],
      "culturalMoment": "one sentence describing a meaningful cultural moment"
    }
  ]
}`;

  const result = await callAI(prompt, { temperature: 0.7, maxOutputTokens: 1500, json: true });
  if (!result.ok) return result;

  try {
    return { ok: true, itinerary: extractJson(result.text) };
  } catch {
    return { ok: false, error: 'The model returned malformed JSON for the itinerary.' };
  }
}

/** Generate a short cultural insight about a specific heritage element. */
export async function generateCulturalInsight(heritageItem, context = '') {
  const prompt = `Explain the cultural significance of "${heritageItem}" in India${context ? ` in the context of ${context}` : ''}.

Write 2-3 sentences that are culturally accurate, reveal a deeper meaning (not just surface facts), and are written for a curious traveler — like wisdom shared by a knowledgeable elder, not a textbook entry.`;

  const result = await callAI(prompt, { maxOutputTokens: 220 });
  return result.ok ? { ok: true, insight: result.text } : result;
}

/**
 * Generate a personalized, actionable suggestion for engaging respectfully
 * and authentically with local culture at this destination — distinct from
 * the static illustrative connector profiles, this is a live model call
 * grounded in the traveler's actual mood/interests.
 */
export async function generateConnectionTip({ mood, interests, destination }) {
  const prompt = `A traveler feeling ${mood} and interested in ${interests.join(', ')} wants to engage authentically with local culture in ${destination.name}, ${destination.state} — not as a tourist watching from a distance, but as a respectful participant.

Suggest one specific, actionable way they could do this during their visit. Ground it in something real about ${destination.name}: one of its intangible heritage traditions (${destination.intangibleHeritage.join(', ')}) or local cuisine (${destination.cuisine.join(', ')}).

Write 2-3 sentences. Be concrete (what to do, roughly where/when) and be honest that showing up with humility and asking permission matters more than any single activity. Avoid generic advice like "be respectful" without specifics.`;

  const result = await callAI(prompt, { temperature: 0.85, maxOutputTokens: 220 });
  return result.ok ? { ok: true, tip: result.text } : result;
}

// checkAIHealth() fires a real (tiny) network request. DestinationDetail
// calls it on every mount, and a traveler flipping between several
// destinations in one session shouldn't cost a fresh round-trip each time —
// that's a wasted request against the same rate-limited API the actual
// features depend on. Cache the outcome for a short window instead.
const HEALTH_CACHE_TTL_MS = 60000;
let healthCache = null; // { result: boolean, checkedAt: number } | null
let healthCheckInFlight = null;

/**
 * Lightweight connectivity check used to show a live/offline badge in the UI.
 * Memoized for HEALTH_CACHE_TTL_MS so repeated mounts within that window
 * (e.g. backing out to Matching and opening another destination) reuse the
 * last result instead of firing a new request every time.
 */
export async function checkAIHealth() {
  if (!isConfigured(getGeminiKey()) && !isConfigured(getGroqKey())) return false;

  const now = Date.now();
  if (healthCache && now - healthCache.checkedAt < HEALTH_CACHE_TTL_MS) {
    return healthCache.result;
  }
  // Two components mounting in the same tick shouldn't double-fire either.
  if (healthCheckInFlight) return healthCheckInFlight;

  healthCheckInFlight = callAI('Reply with exactly: OK', { maxOutputTokens: 10 })
    .then((result) => {
      healthCache = { result: result.ok, checkedAt: Date.now() };
      return result.ok;
    })
    .finally(() => {
      healthCheckInFlight = null;
    });

  return healthCheckInFlight;
}
