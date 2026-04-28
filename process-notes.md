# Process Notes

## /scope

### How the idea evolved
Started as a standard "log meals, track calories" app. Through the brain dump, revealed a strong personal motivation: the post-workout moment — tired, need protein fast. Then a major pivot emerged: the learner doesn't want a logging app at all. They want a planning-first app with just two touchpoints a day (morning + night). This fundamentally changed the concept from reactive tracker to proactive planner.

### Pushback received and response
Pushed hard on scope: photo/image macro analysis, post-workout recipe flow, sweet treat suggestions, and catch-up logic were all present. Learner made the right cut — dropped photo analysis (too complex for hackathon), post-workout specific flow, and sweet treats. Kept the core two-touchpoint loop cleanly.

### References that resonated
Welling resonated most — the "remaining macros" framing is the right mental model. But learner was clear: "it's a lot more different" — theirs is planning-first, not logging-first.

### Deepening rounds
Zero deepening rounds — learner moved decisively to scope generation once the core flow was clear. Direct and focused, as predicted in the learner profile. The conversation gave enough richness without extra rounds.

### Active shaping
Learner drove almost every key decision: the post-workout use case, the "two touchpoints only" philosophy, the no-guilt end-of-day framing, the manual macro entry decision (over photo analysis). The most surprising contribution was the "fake diet people" insight — a real behavioral observation that shaped the non-judgmental tone of the whole app. Learner also unprompted added the frontend priority: "do a better job at frontend, that's what users get impressed right" — this is now a named priority in the scope doc.

## /prd

### What changed vs scope
- **Macros expanded:** Scope had calories, protein, fiber. PRD adds carbs and fats — learner added these mid-conversation without prompting.
- **Time-aware routing added:** Not in scope at all. Learner introduced this organically when asked what happens after setup. Full four-window routing (morning / afternoon / night / sleep screen) emerged from one question.
- **Afternoon path clarified:** If morning was missed, user gets the full morning check-in form — same three fields, same analysis, same snack suggestions.
- **Snack suggestions made interactive:** Scope said "suggestions." PRD specifies tapping adds to a Snacks section and macro rings update live. Learner specified this directly.
- **Night check-in deepened significantly:** Scope described it at surface level. PRD now has two explicit paths, tick-box confirmation with conditional logic for unticked/skipped items, affirmation cards for skips, and the no-morning-log edge case.
- **Calendar + streak added:** Not in scope. Learner introduced mid-conversation. Calendar shows ✓/✗ per day; streak counter shows consecutive goal days. Kept after scope-guard conversation.
- **Mascot character established:** Emerged from the affirmation card discussion. Learner decided it's a consistent character across all emotional touchpoints. Will be designed in Canva.
- **Sleep screen added:** 12:01am–5am window with mascot sleeping in bed. Learner added this detail unprompted.

### "What if" moments that surprised them
- The 12pm–6pm gap: learner had defined morning and "afternoon as 6pm–12am" initially, leaving a dead zone. Needed prompting to identify the afternoon missed-morning window.
- Re-open during morning window: learner hadn't considered what happens when they open the app a second time. Quickly added view mode + update prompt.
- First open at night with no morning log: learner immediately knew the right answer ("you didn't plan today — want to log what you actually ate?") — good instincts.
- Skipped meals in Path A: the tick-box flow branching into "what did you actually eat?" vs "did you skip?" and the affirmation card for skips was a genuine elaboration the learner built out on the spot.

### Pushback and strong opinions
- Calendar: scope-guarded it as a potential cut. Learner pushed back clearly — "I want to add it so the user sees the actual days they are consistent." Kept.
- Mascot: learner was clear this should be a consistent character throughout. Also immediately volunteered to design it in Canva.
- Streak: learner asked "can we add a streak or does it take time?" — framed as a question rather than a demand. Confirmed it was a small addition and they agreed to include it.

### Scope guard outcomes
- Calendar/streak: flagged as new feature. Learner kept it — justified by consistency visualization.
- Photo macro analysis, post-workout flow, sweet treats, social features: all held from scope. No pressure to re-add any of these.

### Deepening rounds
Zero deepening rounds — learner chose to proceed directly to PRD after mandatory questions. However, the mandatory question phase was substantive: every question produced new detail, several produced features not in the scope doc at all. The learner was adding richness without needing extra prompting rounds.

### Active shaping
Learner was highly generative throughout. Key moments where they drove requirements:
- Introduced time-aware routing entirely on their own when asked "what happens after setup?"
- Added carbs and fats to the macro tracking mid-conversation
- Designed the full night check-in branching logic including affirmation cards for skips
- Added the sleep screen mascot detail (in bed, centered)
- Pushed back on cutting the calendar and streak
- Volunteered the mascot design plan before being asked
- Asked about Cloud Run deployment — redirected to /spec, but shows they're already thinking ahead about the full product

## /onboard

- **Technical experience:** Python, GCP (Cloud Run, API keys), professional AI agent builder. Intermediate-to-experienced level. Has used Claude via prompting but not yet as a coding agent.
- **Learning goals:** Build an app entirely independently — wants a repeatable end-to-end process.
- **Creative sensibility:** Personal itch — wants to build a diet app for themselves. Practical, functional motivation.
- **Prior SDD experience:** Informal — writes down steps before coding. The instinct is there; the structure is new.
- **Energy/engagement:** Direct and focused. Knows what they want. Likely to move fast once they're in the flow.

## /checklist

### Build preferences chosen
- **Mode:** Step-by-step — one item per `/build` session, `/clear` between each
- **Comprehension checks:** Yes — learner's reasoning: "asking questions can make us clear on what we're building every session"
- **Verification:** Yes — per item, learner runs app and confirms before moving on
- **Git:** Commit after each item
- **Check-in cadence:** Balanced — brief explanation + verify + move on

### Sequencing decisions
- Learner deferred entirely to agent on sequencing: "i don't know you pick"
- Key sequencing rationale explained and accepted: Claude API endpoint goes second (riskiest piece, build early to catch problems while there's still time to pivot)
- Profile screen goes third because every other screen reads from profile data
- SPA routing goes fourth to wire all 9 screens before building their content

### Item count and time estimate
- 13 items total (including Devpost submission as item 13)
- Estimated 15-30 minutes per item → ~3.5–6.5 hours total build time
- Appropriate for an intermediate developer moving at balanced pace

### Submission planning
- Railway deployment confirmed as item 12 — learner already created Railway account and GitHub repo (MacroDay) before checklist generation
- Hero screenshot identified: Evil Vilo ragebait affirmation card on morning results screen
- Submission tagline drafted: "Plan your macros in the morning. Check in once at night. Let Milo cheer you on — or let Evil Vilo roast you."
- Learner asked for agent's take on wow moment rather than naming one themselves — shows trust in agent judgment

### Active shaping
- Minimal active shaping in this phase — learner deferred on sequencing and all preference questions were quick agreements
- One genuine engagement: learner paused mid-session to register Railway account and create GitHub repo — came back to confirm both were done before continuing
- Learner asked a practical question about Railway setup (whether to create a project now) — shows forward-thinking about the deployment pipeline

### Deepening rounds
- Zero deepening rounds — learner chose to proceed directly to checklist generation after mandatory questions
- Checklist items are granular enough (13 items, all with 5-field format) that no deepening was needed

## /build

### Step 11: Railway deployment — live URL

- What was built: Fixed UTF-16 encoded `.gitignore` (was silently failing — git ignores non-UTF-8 gitignore files). Untracked `.env` from git history (step 1 commit only had placeholder key, real key was never pushed). Added `__pycache__/` and `.claude/` to `.gitignore`. Added all `docs/` files to the repo. Pushed 15 local commits to GitHub (`Amulya631/MacroDay`). Guided Railway Variables setup — key was initially added to shared project variables (wrong), moved to service-level Variables tab (correct). App deployed at https://web-production-5c594.up.railway.app/
- Verification: Full demo flow confirmed on live URL in incognito Chrome — profile setup, morning check-in, analyze, macro rings, snack add with live ring update, voice input all working. Network tab showed 200 on `/api/analyze`.
- Comprehension check: "Why did ANTHROPIC_API_KEY need to go in Railway's Variables tab rather than hardcoded in main.py?" — answered "Variables tab encrypts the key" (close; corrected to: secrets in code end up in the GitHub repo where anyone can read them).
- Issues: Initial 500 errors because API key was added to Railway shared/project variables instead of the service-level Variables tab. Fixed by adding key directly to the service Variables tab — redeployed and worked immediately.

### Step 10: Remaining screens + full CSS polish

- What was built: Full `#screen-midday` — 5 SVG macro rings with `midday-` prefix, read-only meal list (`mealRow` helper), "Update meals" button calls `updateMorningPlan()` which pre-fills the morning form fields from localStorage and navigates back. `initMiddayScreen()` reads `macroday_today.morning_analysis` and calls `renderRings` with `'midday-'` prefix. Full `#screen-afternoon` — mascot image (switched by `initAfternoonScreen()`), two-button layout ("Yes, log my meals" / "No thanks"), idle confirmation message on skip, `afternoonLogMeals()` routes to morning screen, `afternoonSkip()` shows idle message and hides buttons. Full `#screen-sleep` — centered mascot image, dynamic punchline from `initSleepScreen()` based on mascot preference (Vilo gets roast, Milo gets encouragement). `routeOnLoad()` updated to call `initMiddayScreen()`, `initAfternoonScreen()`, and `initSleepScreen()` when routing to those screens. CSS polish pass: mobile breakpoint (`@media max-width: 480px`) with smaller rings and stacked buttons, midday meal list styles, afternoon mascot/button/idle styles, sleep screen centered layout with large mascot image and drop-shadow.
- Issues: None. `escapeHtml` was already defined in the night check-in section — `mealRow` reuses it cleanly.

### Step 9: End-of-day summary + day rollover

- What was built: Full `#screen-summary` with 5 SVG macro rings (IDs prefixed `ring-summary-` to avoid ID conflicts with morning result rings). `renderRings` updated to accept an optional `prefix` parameter (default `''` — backward compatible). `renderSummary(result, profile)` in `analyze.js`: renders rings with `'summary-'` prefix, sets feedback and mascot card, updates subtitle based on ≥90% average, shows/hides snack suggestion section based on performance. `toggleSummarySnacks()` toggles a collapsible snack list from the night API response. `rolloverDay()` in `app.js`: pushes `final_analysis` to `macroday_history` keyed by date, resets `macroday_today` to `{ date: today, morning_logged: false }`, routes to `#screen-sleep`.
- Verification: Summary screen showed 5 rings with fill amounts. Snack suggestions appeared when "Want a suggestion" was clicked. "See you tomorrow" routed to sleep screen. localStorage confirmed `macroday_history` entry and `morning_logged: false` reset.
- Comprehension check: skipped — user moved straight to a follow-up fix.
- Issues: Claude was returning long feedback and affirmation text. Fixed by adding explicit length cap to the system prompt: "feedback" ≤ 2 sentences, "affirmation" ≤ 1 sentence. Also noted: summary snack suggestions are display-only by design (no Add button — end-of-day, no re-analysis needed).

### Step 8: Night check-in — Path A, Path B, and no-morning-log edge case

- What was built: Full `#screen-night` with two paths and no-morning-log edge case. Path A: tick-box list renders from `macroday_today.meals`; "Show me what I missed" enables after first checkbox interaction; inline expansions appear for unticked items; Branch A1 (re-entry) and Branch A2 (skip with inline mascot affirmation card) both resolve items; `checkAllNightResolved()` enables "See my results" when all items resolved. Path B: three text areas + mic buttons. No-morning-log: mascot "it's okay" card + three text areas. All paths call `POST /api/analyze` with `mode: "night"` and route to `#screen-summary`. `saveNightResult()` writes `night_logged`, `actual_meals`, and `final_analysis` to `macroday_today`. `startVoice` generalized with optional `listeningElId` parameter and now dispatches `input` event on the textarea (works for both morning and night fields).
- Verification: Path A tick-boxes rendered from morning meals. "Show me what I missed" enabled after checkbox interaction. Unticked items showed expansion areas. Skip branch showed inline mascot card (Got it dismiss resolved item). Re-entry branch confirmed what-I-ate. Path B three text areas worked and routed to summary. No-morning-log edge case showed correct mascot message and inputs.
- Issues (resolved in follow-up session): Two bugs found during re-verification. (1) CSS specificity bug: `.hidden { display: none }` was overridden by `.tick-expansion { display: flex }` and `.skip-mascot-card { display: flex }` which appear later in style.css — fixed by adding `!important` to `.hidden`. This was causing all expansion areas and skip cards to be visible immediately on load. (2) Skip card image load order: `resolveItemSkipped` was setting `img.src` while the card was still `display: none` — Chrome won't load images on hidden elements, resulting in a broken image icon. Fixed by showing the card first, then setting src. Comprehension check: "What does `nightState.resolved` contain when the user clicks See my results?" — answered correctly: the final state of every meal (each key maps to typed text or the string 'skipped').
- Learner concerned about hitting context limit — noted that `/clear` between steps handles this; no tokens wasted.

### Step 7: Snack suggestions + live ring updates

- What was built: `renderSnackSuggestions(suggestions)` in `analyze.js` renders 2–3 snack cards below the mascot affirmation card. Each card shows snack name + macro contribution string + green "Add" button. `addSnack(index)` appends the snack name to `macroday_today.meals.snacks[]` in localStorage, re-calls `/api/analyze` with the full updated meal list, then re-renders rings, feedback, mascot card, and fresh snack suggestions. `doneSnacks()` hides the section. `renderMorningResults` updated to call `renderSnackSuggestions` on initial load. Loading state ("Recalculating…") shown during re-call.
- Verification: Snack section appeared after morning analysis. Clicking "Add" triggered recalculation and ring update. Console confirmed: `JSON.parse(localStorage.getItem('macroday_today')).meals.snacks` returned `['Greek yogurt (200g) with berries (80g)']` — correct.
- Comprehension check: pending (see below)
- Issues: DevTools localStorage panel showed stale view — user thought snacks weren't saved. Confirmed working via console. No code issue.

### Step 6: Morning results — SVG macro rings + AI feedback + mascot affirmation card

- What was built: `#screen-morning-result` expanded with full layout — 5 SVG macro rings (calories/protein/fiber/carbs/fats) using `stroke-dasharray` pattern, AI feedback block with green left-border styling, mascot affirmation card (image + message). `analyze.js` extended with `renderRings(macros, targets)`, `renderMascotCard(affirmation, mascot)`, and `renderMorningResults(result, meals, profile)`. `submitMorning()` updated to handle `needs_clarification: true` (shows yellow inline message, keeps form open) and calls `renderMorningResults` on success. `style.css` extended with ring colors, flex grid layout, feedback section, and mascot card styling.
- Verification: Learner confirmed 5 rings visible with fill amounts. Vilo feedback and affirmation card visible. localStorage confirmed: `macroday_today.morning_logged: true`, full `morning_analysis` with macros, gaps, feedback, snack_suggestions, affirmation — all correct structure.
- Comprehension check: pending (see below)
- Issues: First submit attempt triggered clarification path — learner's meal descriptions were too vague for Vilo's standard. Re-submitted with specific quantities and got past the gate.
- Note: Learner's reaction to seeing Vilo in action: "I love the response." Good sign for the hero screenshot in the Devpost submission.

### Step 5: Morning check-in form — meal input + voice

- What was built: Full `#screen-morning` with three meal text areas (Breakfast, Lunch, Dinner), mic buttons per field, `updateAnalyzeBtn()` using `.some()` to enable the submit button when any field has content, `startVoice()` using `webkitSpeechRecognition` with listening indicator and pulse animation, `submitMorning()` async function that POSTs to `/api/analyze` with loading state, stores result in `window._morningResult`, and navigates to `screen-morning-result`. `callAnalyze(payload)` added to `analyze.js` as the bare fetch wrapper.
- Verification: Forced hour to 7 to reach morning screen. Typed meal in Breakfast field — button activated. Clicked "Analyze My Plan" — POST to `/api/analyze` confirmed visible in Network tab. Loading state appeared.
- Comprehension check: "What condition enables the 'Analyze My Plan' button?" — answered correctly: "At least one field has text" (`.some()` not `.every()`).
- Issues: None. Hour restored to `new Date().getHours()` after testing.

### Step 4: SPA screen architecture + time-aware routing

- What was built: `routeOnLoad()` — checks profile, runs day rollover, routes to correct screen by hour. `handleDayRollover()` — pushes yesterday's data to `macroday_history` and resets `macroday_today` on new day. `averageMacroPercent()` — shared 90% threshold utility. `saveProfile()` now routes to time-appropriate screen after saving. `DOMContentLoaded` calls `routeOnLoad()` instead of always forcing profile screen.
- Verification: Tested all four time windows by hardcoding hour value. Hour 14 → `screen-afternoon`, hour 20 → `screen-night`, hour 2 → `screen-sleep`. All correct. Restored `new Date().getHours()` after testing.
- Comprehension check: "What does `routeOnLoad()` check first?" — answered correctly: whether `macroday_profile` exists in localStorage (B).
- Issues: None.
- Notes: Learner correctly noted that screens only show placeholder headings for now — content gets built in steps 5–10.

### Step 3: Profile screen — goal selector, macro targets, mascot toggle

- What was built: Full profile screen with goal buttons (Bulking/Cutting/General Health), five macro number inputs, mascot toggle with image previews (Milo/Vilo), Save Profile button, confirmation message. `saveProfile()` validates fields and writes `macroday_profile` to localStorage. `loadProfileForm()` re-populates form on return visits. CSS: nav bar, goal buttons with active state, mascot toggle cards, macro input rows, confirmation message styling.
- Verification: Learner confirmed all UI elements visible. Saved profile `{"goal":"cutting","targets":{"calories":2000,"protein":50,"fiber":20,"carbs":100,"fats":40},"mascot":"milo"}` — correct structure confirmed in DevTools localStorage.
- Comprehension check: "Where does profile data get stored?" — answered correctly: browser's localStorage (B).
- Issues: None.

### Step 2: POST /api/analyze — Claude Haiku integration

- Built: `AnalyzeRequest` Pydantic model (meals, targets, mode, mascot). Dynamic system prompt switching between Milo (warm/encouraging) and Vilo (ragebait/harsh) voices. Vague-input detection returns `needs_clarification: true`. Calls `claude-haiku-4-5-20251001` with `max_tokens=1000`, `temperature=0.7`. Parses JSON response and returns all fields.
- Verification: Tested with vague meals — Vilo returned "embarrassingly vague" clarification message. Tested with specific quantities — returned full macro JSON (calories: 2185, protein: 168, fiber: 11, carbs: 289, fats: 52) with gaps calculated. Both paths confirmed working.
- Comprehension check: skipped this session due to extended debugging.
- Issues: Route wasn't appearing in FastAPI docs due to Pydantic schema generation issue with `Optional[list[str]]`. Fixed with `List[str] = Field(default_factory=list)`. Also required killing stale uvicorn processes to get clean reload.

### Step 1: Project scaffold — FastAPI serving static files locally

- Built: `main.py` with FastAPI, two StaticFiles mounts (`/static`, `/assets`), `GET /` returning `index.html`. Created `static/index.html` (placeholder), `style.css`, `app.js`, `analyze.js`, `calendar.js` (all empty). Created `requirements.txt`, `Procfile`, `.env`. Moved mascot PNGs from root into `assets/`.
- Verification: Learner confirmed `http://localhost:8000` shows "MacroDay" heading; mascot image loads at `/assets/Milo_Good.png`. No console errors.
- Comprehension check: "Why two separate `app.mount()` calls?" — answered correctly: two directories, two mounts.
- Notes: Learner noted UI will be improved later — confirmed step 10 is the polish pass.

## /spec

### Technical decisions made

- **Stack:** FastAPI (Python) + vanilla HTML/CSS/JS + Railway (single service) + localStorage. Learner chose HTML/CSS over React — comfort over stretch on the frontend. FastAPI was a fast choice (had used it before or was comfortable with Python). Railway chosen over GCP Cloud Run because it's simpler for a demo.
- **Single service:** FastAPI serves both the static frontend and the API. Eliminates CORS issues and two-service Railway complexity.
- **Single `/api/analyze` endpoint:** One endpoint handles morning, night, and snack re-calculation. Mode field switches Claude's analysis type.
- **Claude Haiku 4.5:** Chosen for speed and cost. Fractions of a cent per request. Perfect for structured nutrition JSON output.
- **Vague input → clarification:** Claude returns `needs_clarification: true` instead of guessing from vague descriptions. Learner was decisive: "we can't guess the macros based on that."
- **Snack loop:** After each snack added, rings update and a new suggestion appears. "Done" button closes the loop. Learner specified both behaviors in one answer.
- **Calendar threshold:** 90% average across all 5 macros = ✓ (not all-5-individually). Learner chose average, then added the day-detail popup (tapping a day shows all 5 macro stats) unprompted.

### Two mascots — the biggest creative decision

- Learner introduced Milo (good) and Evil Vilo (bad) mid-conversation — not in PRD at all. This became a first-class architectural component.
- Vilo is not just edgy — learner specified "genuinely harsh" and introduced the **ragebait** concept themselves. Claude's system prompt for Vilo mode will be explicitly instructed to be provocative and dismissive.
- Mascot toggle lives in profile settings (localStorage). Both PNG assets (`Milo_Good.png`, `Vilo_Evil.png`) already existed in the project before /spec started.
- Affirmation cards now appear on: morning results, night skipped meals, night no-log edge case, end-of-day summary, sleep screen.

### Confidence vs uncertainty

- **Confident:** Stack choices, deployment, localStorage schema, mascot concept, ragebait tone for Vilo
- **Deferred:** Macro ring rendering (CSS conic-gradient vs SVG — noted as open issue), Web Speech API fallback for non-Chrome browsers

### Deepening rounds

- One deepening round (4 questions). All 4 produced spec-level decisions that would have caused build stalls:
  1. Vague input handling → clarification, not estimation
  2. Vilo's tone ceiling → ragebait, genuinely harsh (learner introduced ragebait concept)
  3. Snack suggestion loop → refreshes after each addition, Done button to close
  4. Calendar threshold → 90% average + tap-to-see-stats (learner added day detail popup)

### Active shaping

- Learner drove almost every major decision: HTML/CSS over React, single Railway service, Milo/Vilo duality, ragebait as a design principle for Vilo, day-detail popup on calendar.
- Pushed back on nothing — all proposals landed without friction.
- Most surprising contribution: introducing "ragebait" as an explicit design pattern for Vilo's affirmation cards. This came from the learner, not from any prompting.
