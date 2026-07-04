# Ghumlo — Cultural Compass India

A GenAI-powered travel companion that helps travelers discover Indian destinations, uncover hidden gems, and engage with local heritage — with every AI feature backed by a real, live call to an LLM API (Gemini primary, Groq automatic fallback).

## Run it (2 minutes)

```bash
npm install
cp .env.example .env      # then paste your real key(s) into .env
npm run dev
```

Get a free Gemini key at https://aistudio.google.com/apikey and paste it in as `VITE_GEMINI_API_KEY`. Optionally also get a free Groq key at https://console.groq.com/keys and add it as `VITE_GROQ_API_KEY` — it's used automatically as a fallback if Gemini is rate-limited, overloaded (503), or briefly down. Restart `npm run dev` after editing `.env`. Without any key configured, the app still runs and clearly tells you the AI features are unavailable — it never fakes a response (see "How disqualification risks are avoided" below).

Other commands:

```bash
npm run build     # production build (verified working — see below)
npm test           # 14 unit tests (vitest)
npm run lint       # eslint, zero warnings allowed
```

## What it does

1. **Onboarding** — traveler shares their name, current mood, and cultural interests.
2. **Matching** — a deterministic scoring function (`matchDestinations`, unit-tested) ranks 6 real Indian destinations against that profile. No AI call here — it's a transparent algorithm, not disguised as "AI magic."
3. **Destination detail**, per selected destination:
   - **Story** — a fully personalized narrative, generated live for that traveler's name, mood, and interests.
   - **Hidden Gems** — 3 off-the-beaten-path suggestions, generated live as structured JSON.
   - **Heritage** — real, well-known heritage sites and intangible-heritage traditions, each with an optional "Get AI cultural insight" button that calls the model live.
   - **Events** — real, publicly documented recurring events plus the 2026 national festival calendar.
   - **Connect** — sample local-connector profiles illustrating the intended community-matching experience (explicitly labeled as illustrative, since a live directory needs a backend outside this build's scope).
   - **Plan** — a 3-day itinerary, generated live as structured JSON.

## How the AI layer stays reliable

`src/services/aiService.js` is the single place every AI call goes through:

1. Try Gemini (`gemini-2.5-flash`). On a transient error (429/500/503/504), retry with backoff.
2. Still failing? Fall back to a second Gemini model (`gemini-2.0-flash`), with its own retry.
3. Still failing, and a Groq key is configured? Fall back to Groq (`llama-3.3-70b-versatile`) as a fully independent provider.
4. Only if every attempt fails does the caller get `{ ok: false, error }` — which the UI renders as a visible, honest error state.

This was added after hitting a real Gemini 503 ("model experiencing high demand") mid-build — rather than switching providers wholesale (which would have meant a backend proxy for most alternatives, see below), the fix was to make the existing working path resilient and add one CORS-compatible fallback.

**Why not NVIDIA's NIM catalog / other providers?** They were considered, but their endpoints don't send `Access-Control-Allow-Origin` on preflight requests (verified with a manual CORS test) — meaning a pure-frontend app like this one can't call them directly from the browser without standing up a backend proxy. Groq's endpoint does support direct browser calls, which is why it's the fallback here instead.

**Why not Ollama?** It only works on whichever machine has it installed with the model already downloaded. Since this hackathon's judging process runs a hands-on functional evaluation of submissions independently, a local-only dependency would break every AI feature on the judges' machines.

## How disqualification risks are avoided

Built against the "How Not to Get Disqualified" checklist:

- **No static/hardcoded pages presented as functional**: every "Generate with AI" button performs a real `fetch` to a live model endpoint. There is no canned narrative hiding behind that button — removing it was a deliberate choice while cleaning up the original draft, which had a static fallback story that could get mislabeled as AI output.
- **No mock/fake data presented as real output**: destination names, heritage sites, and 2026 festival dates are real, publicly documented facts, and the UI never claims they came from the model. Local-connector profiles are explicitly labeled as illustrative sample data, not a live directory.
- **No hallucinated AI responses**: every AI call goes through `src/services/aiService.js`, which returns `{ ok: true, ... }` only when a real model actually produced usable content, or `{ ok: false, error }` otherwise. The UI (`src/components/DestinationDetail.jsx`) renders an explicit error state on failure — it never substitutes static text and calls it AI-generated. UI copy also never hardcodes which provider answered (it could be Gemini or Groq), so labels say "AI" rather than falsely attributing every response to one brand.
- **Test end-to-end before submission**: `npm run build`, `npm test`, and `npm run lint` all pass (see verification below). Walk through onboarding → matching → each of the 5 destination tabs with real API key(s) before you present.

## Security & known trade-offs

- Keys live in `.env` (git-ignored) and are read via `import.meta.env.VITE_*` — never hardcoded in source.
- This is a pure static frontend with no backend, so like any client-only app calling a third-party API directly, keys are bundled into the shipped JS and visible to anyone who inspects the build. For a hackathon demo this is an accepted trade-off; a production version should proxy calls through a small backend that holds keys server-side.
- All network calls have a 20s timeout and structured error handling (no unhandled promise rejections).
- If you ever paste a real API key into a chat, doc, or commit by mistake, treat it as compromised and rotate it immediately at the provider's console — don't just remove it from view.

## Project structure

```
src/
  components/
    OnboardingScreen.jsx    # step 1: name, mood, interests
    MatchingScreen.jsx      # step 2: ranked destination cards
    DestinationDetail.jsx   # step 3: 5-tab destination view + all AI calls
    ui.jsx                  # shared presentational primitives
  data/
    indiaHeritage.js        # static reference data + matchDestinations()
    indiaHeritage.test.js   # unit tests for the matching/festival logic
  services/
    aiService.js             # all AI calls: Gemini w/ retry+fallback, then Groq
    aiService.test.js         # verifies graceful failure with no provider configured
    geminiAI.js               # deprecated re-export shim kept for compatibility
    geminiAI.test.js           # verifies the shim stays in sync
  App.jsx                   # 3-screen state machine
  main.jsx / index.css
```

## Verification run (this build)

```
npm test    → 3 test files, 14 tests, all passing
npm run build → 1862 modules transformed, built in ~2.5s, no errors
npm run lint  → 0 errors, 0 warnings
```

## Accessibility & responsiveness

- Semantic roles (`role="tab"`, `role="radiogroup"`, `role="alert"`, `aria-selected`, `aria-pressed`, `aria-live`) on interactive controls.
- Visible focus rings (`:focus-visible`) and full keyboard operability (cards are real `<button>` elements, not click-only `div`s).
- Responsive Tailwind layout (`sm:`/`lg:` breakpoints) — tested from mobile width up to desktop.
