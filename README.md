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
npm run build          # production build (verified working — see below)
npm test                # 36 tests across 8 files (vitest + React Testing Library)
npm run test:coverage   # same tests with an HTML/text coverage report
npm run lint            # eslint, zero warnings allowed
```

### Deploying it (not just running it locally)

**If you deploy this (Vercel, Netlify, GitHub Pages, etc.) and every AI feature shows "No AI provider configured", this is why:** Vite bakes `import.meta.env.VITE_*` values into the JS bundle at **build time**. Your local `.env` file is git-ignored on purpose (see Security below) — it never reaches the hosting platform, so a build that only has your local `.env` and no server-side config will ship with no key at all, even though `npm run dev` on your own machine works perfectly. This tripped us up during the build too.

To fix it: add `VITE_GEMINI_API_KEY` (and optionally `VITE_GROQ_API_KEY`) as **Environment Variables in the hosting platform's own dashboard**, then trigger a fresh deploy (not just a page refresh):

- **Vercel**: Project → Settings → Environment Variables → add both, then redeploy from the Deployments tab.
- **Netlify**: Site configuration → Environment variables → add both, then trigger a new deploy.
- **GitHub Pages**: static hosting has no server-side env step at all — you'd need to bake the key into the build in CI (e.g. a GitHub Actions secret passed to `npm run build`) or accept that Pages can't hold a secret safely for a client-only app.

`aiService.js` now detects `import.meta.env.PROD` and shows this exact guidance (rather than "add it to your `.env`", which is meaningless once deployed) directly in the error banner — see `noProviderConfiguredMessage()`.

## What it does

1. **Onboarding** — traveler shares their name, current mood, and cultural interests.
2. **Matching** — a deterministic scoring function (`matchDestinations`, unit-tested) ranks 6 real Indian destinations against that profile. No AI call here — it's a transparent algorithm, not disguised as "AI magic." Every destination carries an explicit, curated `interestTags` array so all 10 onboarding interest options actually influence the ranking (see the bug this fixed, below), plus a mood bonus for all 6 mood options.
3. **Destination detail**, per selected destination, as five tabs:
   - **Story** — a fully personalized narrative, generated live for that traveler's name, mood, and interests.
   - **Hidden Gems** — 3 off-the-beaten-path suggestions, generated live as structured JSON.
   - **Heritage** — real, well-known heritage sites and intangible-heritage traditions, each with an optional "Get AI cultural insight" button that calls the model live.
   - **Events** — real, publicly documented recurring events plus the 2026 national festival calendar. No AI call on this tab by design — it's reference data, not generated.
   - **Connect** — sample local-connector profiles illustrating the intended community-matching experience (explicitly labeled as illustrative, since a live directory needs a backend outside this build's scope), plus a live AI call that suggests one concrete, honest way to engage with local culture based on the traveler's actual mood/interests — the part of this tab that's genuinely generative rather than static.
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

**Every AI-triggering button is re-entrancy-safe.** `src/hooks/useAsyncAI.js` ignores a second click while a request is already in flight, instead of firing a duplicate network call — this closes a real bug an earlier version had (rapid-clicking "Generate another" could fire overlapping requests).

## Two real bugs fixed in this pass

**1. Matching felt like "the same 6 destinations, just reordered."** It was a real bug, not just a perception problem. `matchDestinations()` used to score interests by checking whether the interest word was a literal substring of destination text (e.g. does `dest.type` contain the word "food"?). That silently made 4 of the 10 onboarding interest checkboxes — Local Cuisine (`food`), Folk Art & Stories (`folklore`), Textiles & Weaving (`textiles`), and the type-level bonus for Ancient Temples (`temples`) — contribute **zero points no matter what a traveler picked**, because those words never literally appear inside any dish name, heritage tradition string, or `type` field. Two of the six moods (`foodie`, `historical`) also had no scoring bonus at all, unlike the other four. Fix: every destination in `indiaHeritage.js` now carries an explicit, curated `interestTags` array using the same values as `OnboardingScreen`'s `INTEREST_OPTIONS`, so tag matching is a reliable intersection instead of fragile string-guessing, and every mood has a bonus. `indiaHeritage.test.js` has a regression test (`every onboarding interest option matches at least one destination`) specifically so this can't silently regress again.

**2. "No AI provider configured" after deploying.** Not a code bug so much as a documentation gap that looked like a bug: `.env` is git-ignored and never reaches a hosting platform's build. See "Deploying it" above for the fix and the now-PROD-aware error message.

## How disqualification risks are avoided

Built against the "How Not to Get Disqualified" checklist:

- **No static/hardcoded pages presented as functional**: every "Generate with AI" button performs a real `fetch` to a live model endpoint. There is no canned narrative hiding behind that button — removing it was a deliberate choice while cleaning up the original draft, which had a static fallback story that could get mislabeled as AI output.
- **No mock/fake data presented as real output**: destination names, heritage sites, and 2026 festival dates are real, publicly documented facts, and the UI never claims they came from the model. Local-connector profiles are explicitly labeled as illustrative sample data, not a live directory.
- **No hallucinated AI responses**: every AI call goes through `src/services/aiService.js`, which returns `{ ok: true, ... }` only when a real model actually produced usable content, or `{ ok: false, error }` otherwise. The UI renders an explicit error state on failure — it never substitutes static text and calls it AI-generated. UI copy also never hardcodes which provider answered (it could be Gemini or Groq), so labels say "AI" rather than falsely attributing every response to one brand.
- **Test end-to-end before submission**: `npm run build`, `npm test`, and `npm run lint` all pass (see verification below). Walk through onboarding → matching → each of the 5 destination tabs with real API key(s) before you present.

## Mapping to the judging criteria

- **Code**: the app is organized by responsibility, not dumped into one file — `src/components/destination/` holds one file per tab, `src/hooks/useAsyncAI.js` is a single reusable hook that replaced four hand-copied `{data, error, loading}` state blocks, `src/utils/sanitize.js` isolates the one pure input-sanitization function, and `src/services/aiService.js` is the only place that talks to a network API. Naming, JSDoc comments explaining *why* (not just what), and consistent formatting are enforced by `npm run lint` (0 warnings allowed). A top-level `ErrorBoundary` (`src/components/ErrorBoundary.jsx`) means an unexpected render error shows a legible, recoverable fallback instead of a blank white screen.
- **Security**: no secrets in source (`.env`, git-ignored); a `Content-Security-Policy` meta tag in `index.html` restricts scripts to this origin and network calls to only the two AI providers actually used, so a future XSS couldn't quietly exfiltrate data elsewhere; the traveler-name field (the one piece of free text echoed into every AI prompt) is length-capped and stripped of control/angle-bracket characters (`src/utils/sanitize.js`) to blunt the cheapest prompt-injection/DoS vector; `npm audit` findings are all dev-tooling-only (esbuild/vite dev-server CVEs that require an attacker interacting with a running local dev server — they don't ship in the production build) and are documented rather than silently ignored; see below for the full reasoning.
- **Efficiency**: retry/backoff only happens on transient errors (never on a 4xx client error), requests carry a 20s timeout so nothing hangs indefinitely, images are lazy-loaded on the matching screen, re-entrancy guards prevent redundant duplicate API calls, the AI-connectivity health check is memoized for 60s instead of firing a fresh network request on every destination view, and the 5 destination tabs are code-split with `React.lazy`/`Suspense` so only the tab a traveler actually opens is fetched/parsed (verified in the build output — see below).
- **Testing**: 36 tests across 8 files (`npm run test:coverage` for the full report), covering pure logic (matching/festival algorithms, including a regression test for the interest-tag bug above), the AI service's fail-fast contract and health-check caching, and component behavior (onboarding flow, sanitization, tab switching, AI success/error rendering, re-entrancy, error-boundary recovery) via React Testing Library — not just "it renders."
- **Accessibility**: see the dedicated section below — this includes a real, measured WCAG contrast fix, not just aria-labels.
- **Problem statement alignment**: every one of the brief's asks maps to a concrete tab — recommend attractions (Matching, now with a fixed scoring engine where every interest actually matters), hidden gems (Story tab), immersive storytelling (Story tab), heritage promotion (Heritage tab), local events (Events tab), authentic cultural connection (Connect tab, with a genuinely generative AI suggestion rather than only static profiles).

## Security & known trade-offs

- Keys live in `.env` (git-ignored) and are read via `import.meta.env.VITE_*` — never hardcoded in source.
- This is a pure static frontend with no backend, so like any client-only app calling a third-party API directly, keys are bundled into the shipped JS and visible to anyone who inspects the build. For a hackathon demo this is an accepted trade-off; a production version should proxy calls through a small backend that holds keys server-side.
- A `Content-Security-Policy` meta tag (`index.html`) scopes `script-src` to this origin and `connect-src` to this origin plus Gemini's and Groq's API domains — it doesn't hide the bundled key (nothing client-side can), but it does mean a compromised or malicious script can't send data to some other, attacker-controlled domain.
- The one piece of free-form user text that gets echoed into every AI prompt — the traveler's name — is capped at 40 characters and stripped of control characters and `<`/`>` before it's used (`src/utils/sanitize.js`), closing off the cheapest prompt-injection/DoS input. All model *output*, in turn, is still treated as untrusted: JSON responses go through `extractJson`/`try-catch`, never `eval` or `dangerouslySetInnerHTML`.
- All network calls have a 20s timeout and structured error handling (no unhandled promise rejections).
- `npm audit` reports vulnerabilities in `vite`/`esbuild`/`vitest` (dev dependencies only). They all require an attacker to interact with a *running local dev server* (e.g. `GHSA-fx2h-pf6j-xcff`, a Windows-only `server.fs.deny` bypass) — none affect the static production bundle users actually receive. The fix requires a major-version jump to Vite 8, which was deliberately deferred this close to submission rather than risking a last-minute breaking upgrade for a dev-only, non-shipping issue. This is a documented decision, not an oversight.
- If you ever paste a real API key into a chat, doc, or commit by mistake, treat it as compromised and rotate it immediately at the provider's console — don't just remove it from view.

## Project structure

```
src/
  components/
    OnboardingScreen.jsx    # step 1: name, mood, interests (name is sanitized on input)
    MatchingScreen.jsx      # step 2: ranked destination cards
    DestinationDetail.jsx   # step 3 shell: hero, AI-status badge, tab strip (ARIA tabs pattern),
                            #   lazily imports each tab (React.lazy + Suspense)
    ErrorBoundary.jsx        # top-level render-error safety net, wraps <App/> in main.jsx
    destination/
      StoryTab.jsx          # narrative + hidden gems
      HeritageTab.jsx        # sites, intangible heritage, cuisine
      EventsTab.jsx          # real events + festival calendar (no AI call)
      LocalsTab.jsx           # connector profiles + live AI connection tip
      ItineraryTab.jsx        # 3-day AI itinerary
      cards.jsx                # small shared presentational cards
    ui.jsx                  # shared presentational primitives (loading/error/badge/etc.)
    *.test.jsx               # component tests (React Testing Library)
  data/
    indiaHeritage.js        # static reference data (with interestTags) + matchDestinations()
    indiaHeritage.test.js   # unit tests for the matching/festival logic
  hooks/
    useAsyncAI.js            # shared {data,error,loading,run} state machine + re-entrancy guard
  utils/
    sanitize.js              # traveler-name sanitization (prompt-injection/DoS mitigation)
  services/
    aiService.js             # all AI calls: Gemini w/ retry+fallback, then Groq; cached health check
    aiService.test.js         # verifies graceful failure with no provider + health-check caching
    geminiAI.js               # deprecated re-export shim kept for backward compatibility
    geminiAI.test.js           # verifies the shim stays in sync
  test/setup.js             # jest-dom matchers for the test environment
  App.jsx                   # 3-screen state machine
  App.test.jsx              # integration test walking the full screen flow
  main.jsx / index.css
```

## Verification run (this build)

```
npm test      → 8 test files, 36 tests, all passing
npm run build → 1872 modules transformed, built in ~3s, no errors —
                the 5 destination tabs each build as their own chunk
                (React.lazy code-splitting confirmed in the build output)
npm run lint  → 0 errors, 0 warnings
```

Run `npm run test:coverage` locally for the current HTML/text coverage report — numbers shift slightly release to release as tests are added, so rather than quote a specific percentage here that would go stale, this README points at the command that always gives you the live number.

## Accessibility & responsiveness

- **Color contrast, actually measured, not assumed.** The original palette's gold (`#c9a227`) and saffron (`#ff9933`) measured ~2.1-2.4:1 contrast against white when computed via the WCAG relative-luminance formula — well under the 4.5:1 minimum for text, and even under the 3:1 minimum for large text/UI components. Both were replaced with `#8a6914` (gold) and `#b35900` (saffron), which measure ~4.6-5.1:1 in both directions (dark text on white, white text on a solid fill) while staying in the same warm palette. The original lighter gold is kept as `gold-light` for decorative use only (e.g. small text over a dark photo overlay, where the surrounding contrast is different).
- **Motion respects user preference.** The whole app is wrapped in framer-motion's `<MotionConfig reducedMotion="user">`, so every animation (including the continuously spinning compass icons) automatically turns into an instant transition for anyone with `prefers-reduced-motion: reduce` set at the OS level. A CSS-level fallback in `index.css` catches anything animated outside framer-motion.
- **Proper ARIA tabs pattern**, not just visual tabs: `role="tablist"`/`role="tab"`/`role="tabpanel"` with `aria-selected`, `aria-controls`, and `aria-labelledby` wiring the tab strip to its content panel, plus `tabIndex` management so only the active tab is in the normal tab order.
- Semantic roles (`role="radiogroup"`, `role="alert"`, `aria-live="polite"`) on interactive/status controls, visible focus rings (`:focus-visible`), and full keyboard operability (interactive cards are real `<button>` elements, not click-only `div`s).
- Responsive Tailwind layout (`sm:`/`lg:` breakpoints) — tested from mobile width up to desktop.
