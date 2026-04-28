# MacroDay — Technical Specification

## Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript | No framework overhead; full control over UI; fastest to build for someone with Python background |
| Backend | Python 3.11 + FastAPI 0.115+ | Amulya's strongest language; FastAPI is async, fast to set up, auto-generates API docs; serves static files natively |
| AI Layer | Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) | Fast (~200ms), cheap (fractions of a cent per request), strong at structured JSON output for nutrition analysis |
| Storage | Browser localStorage | No auth required; sufficient for demo; ~200KB of data max vs 5MB limit |
| Deployment | Railway (single service) | Amulya's cloud comfort zone; HTTPS by default (required for Web Speech API); one service handles both frontend and API |
| Voice Input | Web Speech API (browser-native) | No library needed; Chrome/Edge only — acceptable for demo |

**Documentation links:**
- FastAPI: https://fastapi.tiangolo.com/
- FastAPI StaticFiles: https://fastapi.tiangolo.com/tutorial/static-files/
- Claude API: https://docs.anthropic.com/en/api/getting-started
- Claude Haiku pricing: https://www.anthropic.com/pricing
- Railway FastAPI deploy guide: https://docs.railway.com/guides/fastapi
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

---

## Runtime & Deployment

- **Runtime:** Web app, runs in browser. Backend runs on Railway.
- **Deployment target:** Live URL on Railway (HTTPS required for Web Speech API)
- **Python version:** 3.11+
- **Environment variables required:**
  - `ANTHROPIC_API_KEY` — set in Railway dashboard under Variables
- **Local dev:** `uvicorn main:app --reload` on port 8000
- **Railway start command (Procfile):** `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Data persistence:** localStorage only. If browser data is cleared, app resets. Acceptable for hackathon demo.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                 Railway Service                      │
│                                                     │
│  FastAPI (main.py)                                  │
│  ├── GET /          → serves static/index.html      │
│  ├── GET /static/*  → serves CSS, JS, assets        │
│  └── POST /api/analyze → calls Claude Haiku API     │
│                              ↓                      │
│                    Anthropic Claude API             │
│                    (claude-haiku-4-5-20251001)      │
└─────────────────────────────────────────────────────┘
              ↕ HTTP (fetch from browser)
┌─────────────────────────────────────────────────────┐
│                   Browser                           │
│                                                     │
│  index.html — 9 screens (show/hide via JS)          │
│  app.js     — routing, screen switching             │
│  analyze.js — API calls, ring rendering             │
│  calendar.js — calendar + streak logic              │
│                                                     │
│  localStorage                                       │
│  ├── macroday_profile   (targets, goal, mascot)     │
│  ├── macroday_today     (current day's log)         │
│  └── macroday_history   (per-day summaries)         │
└─────────────────────────────────────────────────────┘
```

**Core data flow — Morning Check-In:**
```
User types meals → app.js reads profile from localStorage
  → POST /api/analyze { meals, targets, mode:"morning", mascot }
  → FastAPI builds Claude prompt → calls Claude Haiku
  → Claude returns JSON { macros, gaps, feedback, snack_suggestions, affirmation }
  → analyze.js saves to macroday_today.morning_analysis in localStorage
  → JS renders 5 macro rings + AI feedback + snack suggestions + mascot affirmation card
  → User taps snack → snack added to macroday_today.meals.snacks[]
  → Re-calls POST /api/analyze with updated meals → rings re-render
  → User taps "Done" → snack loop ends, plan locked
```

---

## Frontend

### Screen Architecture

One `static/index.html` file. All 9 screens exist as `<section>` elements. JavaScript shows one at a time by toggling a `.active` CSS class. No page reloads.

```
#screen-profile        — Setup: goal selector + 5 macro targets + Milo/Vilo toggle
#screen-morning        — Morning input: Breakfast / Lunch / Dinner fields + mic buttons
#screen-morning-result — Analysis results: macro rings + feedback + snacks + affirmation card
#screen-midday         — View mode: read-only plan + "Update my meals" prompt
#screen-afternoon      — Missed morning: prompt to log anyway or skip to tonight
#screen-night          — Night check-in: Path A (tick-box) or Path B (re-entry)
#screen-summary        — End-of-day: final macro rings + mascot affirmation card
#screen-sleep          — Sleep screen: mascot in bed + go-to-sleep punchline
#screen-calendar       — Monthly calendar + streak counter + day detail popup
```

PRD ref: `prd.md > Time-Aware Routing`, `prd.md > Onboarding & Profile Setup`

### Time-Aware Routing Logic

Runs in `app.js` on every page load.

```javascript
// Pseudocode — implement in app.js
const hour = new Date().getHours();
const profile = localStorage.getItem('macroday_profile');
const today = JSON.parse(localStorage.getItem('macroday_today') || '{}');
const isToday = today.date === new Date().toDateString();

if (!profile) → show('#screen-profile')

else if (hour >= 5 && hour < 12) {       // 5am–11:59am: Morning window
  if (isToday && today.morning_logged)   → show('#screen-midday')
  else                                   → show('#screen-morning')
}
else if (hour >= 12 && hour < 18) {      // 12pm–5:59pm: Afternoon window
  if (isToday && today.morning_logged)   → show('#screen-midday')
  else                                   → show('#screen-afternoon')
}
else if (hour >= 18 && hour < 24) {      // 6pm–11:59pm: Night window
                                         → show('#screen-night')
}
else {                                   // 12am–4:59am: Sleep window
                                         → show('#screen-sleep')
}
```

PRD ref: `prd.md > Time-Aware Routing`

### Profile Screen

PRD ref: `prd.md > Onboarding & Profile Setup`

- Goal selector: three buttons — Bulking / Cutting / General Health
- Five numeric input fields: Calories, Protein (g), Fiber (g), Carbs (g), Fats (g)
- Mascot toggle: switch between Milo (good) and Vilo (evil) — saves to `macroday_profile.mascot`
- "Save Profile" button → writes to localStorage → routes to time-appropriate screen
- Profile icon in nav bar → accessible from any screen at any time

### Morning Check-In Screen

PRD ref: `prd.md > Morning Check-In`

- Three labeled text areas: Breakfast, Lunch, Dinner
- Each has a mic button → activates Web Speech API (Chrome/Edge only)
  - `const recognition = new webkitSpeechRecognition()` → appends transcript to textarea
- "Analyze My Plan" button — visible once at least one field has text
- On submit → calls `analyzeJs.submitMorning(meals, profile)`

### Morning Results Screen

PRD ref: `prd.md > Morning Check-In`, `prd.md > Mascot & App Character`

- **5 macro rings** — SVG circles (decided: SVG over CSS conic-gradient for reliable live updates when snacks are added)
  - Each ring: label + percentage filled + remaining amount (e.g. "45g protein remaining")
  - Macros: Calories, Protein, Fiber, Carbs, Fats
  - SVG pattern per ring:
    ```html
    <svg viewBox="0 0 36 36" class="macro-ring">
      <circle class="ring-bg" cx="18" cy="18" r="15.9"/>
      <circle class="ring-fill" cx="18" cy="18" r="15.9"
              stroke-dasharray="75 25"   <!-- percent filled, remainder -->
              stroke-dashoffset="25"/>   <!-- starts at top -->
    </svg>
    ```
  - JavaScript updates `stroke-dasharray` on every API response — smooth re-render when snacks added
- **AI feedback text** — paragraph from Claude (mascot-toned)
- **Snack suggestions** — 2–3 cards, each showing: snack name + macro contribution
  - Tapping adds snack to plan → re-calls `/api/analyze` → rings update
  - New suggestion appears targeting next biggest gap
  - "Done adding snacks" button → closes suggestion section, locks plan
- **Mascot affirmation card** — image (Milo or Vilo) + affirmation string from API
  - Milo: warm, encouraging
  - Vilo: ragebait, genuinely harsh (e.g. "You call that a meal plan? My grandma bulks harder than this.")

### Mid-Day View Screen

PRD ref: `prd.md > Mid-Day View`

- Read-only display of submitted meal plan
- Current macro rings (from `macroday_today.morning_analysis`)
- Prompt: "Hey, you're back! Want to update your meals?"
- "Update meals" button → unlocks meal fields → re-submits → re-runs analysis

### Afternoon Screen

PRD ref: `prd.md > Afternoon Check-In (Missed Morning)`

- Message: "You missed your morning check-in — want to log your meals for today anyway?"
- "Yes, log my meals" → shows full Morning Check-In form (same fields, same analysis, same results)
- "No thanks, see you tonight" → idle message until 6pm

### Night Check-In Screen

PRD ref: `prd.md > Night Check-In`

Two path selector at top:
- **Path A — "I mostly followed my plan"**

  Step 1 — Tick-box list renders from `macroday_today.meals`:
  ```
  ☐ Breakfast — "2 eggs, 100g oats, 1 banana"
  ☐ Lunch     — "200g chicken breast, rice"
  ☐ Dinner    — "salmon, sweet potato"
  ☐ Snack     — "protein bar"
  ```

  Step 2 — User ticks each item they ate as planned. Unticked = needs resolution.

  Step 3 — User taps "Submit" button (visible once they've interacted with at least one item).
  For every unticked item, an inline expansion appears directly below it:

  ```
  ☐ Lunch — "200g chicken breast, rice"
     ↳ [What did you actually eat?] [text area + mic]
        [I skipped this meal]
  ```

  **Branch A1 — "What did you actually eat?"**
  - User types or speaks what they ate instead
  - Stored as `actual_meals.lunch = "their input"`
  - Expansion collapses, item marked as resolved (pencil icon)

  **Branch A2 — "I skipped this meal"**
  - Meal stored as `actual_meals.lunch = "skipped"`
  - Inline mascot affirmation card appears below (not full-screen):
    - Milo: *"Sounds like a busy day! Have a glass of water or a refreshing juice."*
    - Vilo: *"Skipped lunch. Bold strategy. Painfully wrong, but bold."*
  - Card has a dismiss button → collapses, item marked resolved

  Step 4 — All items are either: ✓ ticked, ✓ re-entered (A1), or ✓ skipped (A2).
  "See my results" button activates → POST /api/analyze with `actual_meals`, mode:"night" → End-of-Day Summary

- **Path B — "My day went differently"**
  - Three text areas (Breakfast, Lunch, Dinner) + mic buttons
  - User enters actual intake → POST /api/analyze with mode:"night" → End-of-Day Summary

- **No morning log edge case:**
  - JS checks `macroday_today.morning_logged === false`
  - Shows: "You didn't plan today — want to log what you actually ate?"
  - Mascot "it's okay" card appears
  - User enters meals → POST /api/analyze → End-of-Day Summary

### End-of-Day Summary Screen

PRD ref: `prd.md > End-of-Day Summary`, `prd.md > Mascot & App Character`

- 5 macro rings showing actual intake vs daily target with exact numbers
- If average ≥ 90% across all 5 macros:
  - Mascot celebration card: Milo — "You did it! Goals hit today." / Vilo — "Fine. You did it. Don't get comfortable."
- If average < 90%:
  - Mascot encouragement card with exact numbers: Milo — "You got X% of your protein goal. Fresh start tomorrow." / Vilo — "X% protein. Embarrassing. Come back tomorrow and do better."
- If still short: "Want a suggestion to close the gap tonight?" → shows 1–2 snack options
- On close → pushes `macroday_today` to `macroday_history` → resets `macroday_today`

### Sleep Screen

PRD ref: `prd.md > Time-Aware Routing`

- Mascot (Milo or Vilo) centered on screen, sleeping in bed
- Go-to-sleep punchline text
- "Come back tomorrow" message

### Calendar Screen

PRD ref: `prd.md > Calendar & Streak`

- Monthly calendar grid (current month by default)
- Each day cell: ✓ (average ≥ 90% all macros), ✗ (< 90%), blank (no data)
- Streak counter: consecutive days where average ≥ 90%
- **Tap any day with data** → popup card showing all 5 macros: target vs actual with exact numbers
- Data source: `macroday_history` in localStorage
- Accessible via nav icon from any screen

---

## Backend

### FastAPI App (`main.py`)

PRD ref: implements all epics via the single API endpoint

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

# Serve static frontend
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

@app.get("/")
async def root():
    return FileResponse("static/index.html")

@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    # Build Claude prompt → call Haiku → parse → return
    ...
```

### POST /api/analyze

**Request body:**
```json
{
  "meals": {
    "breakfast": "2 eggs, 100g oats, 1 banana",
    "lunch": "200g chicken breast, rice, salad",
    "dinner": "salmon, sweet potato",
    "snacks": ["protein bar", "2 tbsp peanut butter"]
  },
  "targets": {
    "calories": 2500,
    "protein": 180,
    "fiber": 35,
    "carbs": 280,
    "fats": 70
  },
  "mode": "morning",
  "mascot": "vilo"
}
```

**Response body:**
```json
{
  "needs_clarification": false,
  "clarification_message": null,
  "macros": {
    "calories": 1800,
    "protein": 140,
    "fiber": 22,
    "carbs": 200,
    "fats": 55
  },
  "gaps": {
    "calories": 700,
    "protein": 40,
    "fiber": 13,
    "carbs": 80,
    "fats": 15
  },
  "feedback": "Your protein is decent but fiber is catastrophically low. Classic.",
  "snack_suggestions": [
    { "name": "Apple + 2 tbsp almond butter", "macros": { "fiber": 5, "protein": 4, "calories": 200 } },
    { "name": "Handful of almonds", "macros": { "fiber": 4, "protein": 6, "calories": 170 } }
  ],
  "affirmation": "40g protein short. You're not going to grow like this. Embarrassing."
}
```

**Vague input handling:**
```json
{
  "needs_clarification": true,
  "clarification_message": "I can't estimate macros from 'some chicken' — how many grams? Was it grilled, fried, with a sauce?",
  ...
}
```
Frontend shows `clarification_message` and keeps the form open for re-entry. No macros returned.

### Claude Prompt Design

**System prompt (built in `main.py`, varies by mascot mode):**

```
You are a nutrition analysis engine. Analyze meal descriptions and return 
structured JSON with macro estimates.

[If mascot == "milo"]:
Write feedback and affirmation in the voice of Milo — a warm, encouraging 
fitness coach. Celebrate wins, frame gaps as opportunities, keep tone 
motivating and non-judgmental.

[If mascot == "vilo"]:
Write feedback and affirmation in the voice of Evil Vilo — a genuinely harsh, 
dismissive villain who uses ragebait. Be provocative. Make the user mad enough 
to prove you wrong. Examples: "Pathetic. 40g short and it's not even noon." 
/ "You call that a meal plan? My grandma bulks harder than this."

Rules:
- If any meal description is too vague to estimate macros (e.g. "some food", 
  "normal lunch"), set needs_clarification: true and write a specific 
  clarification_message asking for portion sizes and preparation method.
- Return ONLY valid JSON. No prose outside the JSON object.
- Snack suggestions should target the biggest macro gap.
- Mode "morning" = plan analysis + snack suggestions.
- Mode "night" = actual intake analysis + end-of-day affirmation.
```

**Model:** `claude-haiku-4-5-20251001`
**Max tokens:** 1000 (sufficient for JSON response)
**Temperature:** 0.7 (allows personality variation in feedback)

---

## Data Model

### localStorage Key: `macroday_profile`

```json
{
  "goal": "bulking",
  "targets": {
    "calories": 2500,
    "protein": 180,
    "fiber": 35,
    "carbs": 280,
    "fats": 70
  },
  "mascot": "vilo"
}
```

### localStorage Key: `macroday_today`

```json
{
  "date": "Fri Apr 25 2026",
  "morning_logged": true,
  "meals": {
    "breakfast": "2 eggs, 100g oats, 1 banana",
    "lunch": "200g chicken breast, rice",
    "dinner": "salmon, sweet potato",
    "snacks": ["protein bar"]
  },
  "morning_analysis": {
    "macros": { "calories": 1800, "protein": 140, "fiber": 22, "carbs": 200, "fats": 55 },
    "gaps": { "calories": 700, "protein": 40, "fiber": 13, "carbs": 80, "fats": 15 },
    "feedback": "...",
    "snack_suggestions": [...],
    "affirmation": "..."
  },
  "night_logged": false,
  "actual_meals": null,
  "final_analysis": null
}
```

**Day rollover logic (runs in `app.js` on page load):**
```javascript
const today = new Date().toDateString();
const stored = JSON.parse(localStorage.getItem('macroday_today') || '{}');
if (stored.date !== today) {
  // Push yesterday to history if it has final_analysis
  if (stored.final_analysis) {
    const history = JSON.parse(localStorage.getItem('macroday_history') || '{}');
    history[stored.date] = {
      goals_hit: averageMacroPercent(stored.final_analysis) >= 90,
      macros: stored.final_analysis.macros,
      targets: profile.targets
    };
    localStorage.setItem('macroday_history', JSON.stringify(history));
  }
  // Reset for new day
  localStorage.setItem('macroday_today', JSON.stringify({ date: today, morning_logged: false }));
}
```

### localStorage Key: `macroday_history`

```json
{
  "Thu Apr 24 2026": {
    "goals_hit": true,
    "macros": { "calories": 2450, "protein": 175, "fiber": 33, "carbs": 270, "fats": 68 },
    "targets": { "calories": 2500, "protein": 180, "fiber": 35, "carbs": 280, "fats": 70 }
  },
  "Wed Apr 23 2026": {
    "goals_hit": false,
    "macros": { ... },
    "targets": { ... }
  }
}
```

**Calendar ✓/✗ logic:**
```javascript
function averageMacroPercent(macros, targets) {
  const keys = ['calories', 'protein', 'fiber', 'carbs', 'fats'];
  const percents = keys.map(k => Math.min(macros[k] / targets[k], 1));
  return (percents.reduce((a, b) => a + b, 0) / keys.length) * 100;
}
// ✓ if averageMacroPercent >= 90, else ✗
```

---

## Mascot System

### Assets

```
assets/
├── Milo_Good.png   — warm, friendly character (default)
└── Vilo_Evil.png   — harsh, villain character
```

### Mascot Component

Every affirmation card is the same HTML structure:

```html
<div class="mascot-card">
  <img id="mascot-img" src="" alt="mascot" />
  <p id="mascot-message"></p>
</div>
```

JavaScript swaps image and message based on `macroday_profile.mascot`:

```javascript
function renderMascotCard(affirmationText) {
  const mascot = getProfile().mascot;
  document.getElementById('mascot-img').src =
    mascot === 'vilo' ? '/assets/Vilo_Evil.png' : '/assets/Milo_Good.png';
  document.getElementById('mascot-message').textContent = affirmationText;
}
```

### Mascot Card Appearances

| Screen | Trigger | Card Type |
|---|---|---|
| `#screen-morning-result` | After plan analysis | Encouraging (on track) or critical (gaps) |
| `#screen-night` | Skipped meal in Path A | "Sounds like a busy day" affirmation |
| `#screen-night` | No morning log | "It's okay, log anyway" affirmation |
| `#screen-summary` | Goals hit ≥ 90% avg | Celebration card |
| `#screen-summary` | Goals not hit | Encouragement / ragebait card |
| `#screen-sleep` | Sleep window (12am–5am) | Mascot in bed, go-to-sleep punchline |

PRD ref: `prd.md > Mascot & App Character`

---

## File Structure

```
my-hackathon-project/
├── main.py                  ← FastAPI app: /api/analyze endpoint + static file serving
├── requirements.txt         ← fastapi, uvicorn, anthropic, aiofiles, python-dotenv
├── Procfile                 ← web: uvicorn main:app --host 0.0.0.0 --port $PORT
├── .env                     ← ANTHROPIC_API_KEY (local dev only, not committed)
├── static/
│   ├── index.html           ← entire frontend: all 9 screens as <section> elements
│   ├── style.css            ← all styles: macro rings, mascot cards, screens, nav
│   ├── app.js               ← routing logic, screen switching, localStorage helpers, day rollover
│   ├── analyze.js           ← POST /api/analyze calls, macro ring rendering, snack loop
│   └── calendar.js          ← calendar grid rendering, streak calculation, day detail popup
├── assets/
│   ├── Milo_Good.png        ← good mascot character
│   └── Vilo_Evil.png        ← evil mascot character
└── docs/
    ├── learner-profile.md
    ├── scope.md
    ├── prd.md
    └── spec.md              ← this file
```

---

## Key Technical Decisions

**1. Single Railway service (FastAPI serves frontend + API)**
FastAPI's `StaticFiles` mount serves `index.html` at `/`. This avoids two separate Railway services, simplifying deployment and eliminating CORS issues. Tradeoff: frontend and backend are coupled in one deploy — acceptable for a hackathon.

**2. Single `/api/analyze` endpoint for all analysis modes**
One endpoint handles morning planning, night check-in, and snack re-calculation. The `mode` field tells Claude which analysis type to perform. Tradeoff: slightly more complex prompt logic, but eliminates duplicate endpoint code. Simpler to build and maintain for a 1-person team.

**3. Vague input → clarification, not estimation**
Claude returns `needs_clarification: true` instead of guessing macros from descriptions like "some chicken." This keeps macro data accurate and teaches users to log with specificity. Tradeoff: slightly more friction on first use; payoff is trustworthy numbers.

**4. Milo/Vilo tone baked into Claude system prompt**
Mascot mode is passed per-request and shapes the entire Claude response — not just the affirmation card but the feedback text too. This means every piece of AI-written text in the app has mascot personality. Tradeoff: slightly longer system prompt; payoff is a fully coherent character voice throughout.

---

## Dependencies & External Services

| Dependency | Version | Purpose | Docs |
|---|---|---|---|
| fastapi | 0.115+ | Backend framework | https://fastapi.tiangolo.com/ |
| uvicorn | latest | ASGI server | https://www.uvicorn.org/ |
| anthropic | latest | Claude API SDK | https://github.com/anthropics/anthropic-sdk-python |
| aiofiles | latest | Required for FastAPI StaticFiles | https://github.com/Tinche/aiofiles |
| python-dotenv | latest | Load .env for local dev | https://github.com/theskumar/python-dotenv |

**External services:**
- **Anthropic Claude API** — Model: `claude-haiku-4-5-20251001`. API key required. Pricing: ~$1/million input tokens — negligible for demo usage. Docs: https://docs.anthropic.com/
- **Web Speech API** — Browser-native, no key needed. Chrome/Edge only. Requires HTTPS (Railway provides this automatically).
- **Railway** — Deployment platform. 30-day free trial with $5 credit; Hobby plan $5/month after. Docs: https://docs.railway.com/guides/fastapi

**Environment variables:**
```
ANTHROPIC_API_KEY=sk-ant-...   ← set in Railway dashboard → Variables
```

---

## Open Issues

**1. Macro ring rendering — RESOLVED: SVG**
SVG `stroke-dasharray` pattern chosen over CSS conic-gradient. More reliable for live updates when snacks are re-calculated. JavaScript updates `stroke-dasharray` values on every API response. See Morning Results Screen section for full SVG pattern.

**2. Night Path A tick-box flow — RESOLVED**
Full step-by-step state machine documented in Night Check-In Screen section. Three resolution states per item: ticked (eaten as planned), re-entered (ate something different), skipped (with inline mascot affirmation card). "See my results" button activates only when all items are resolved.

**3. Web Speech API fallback**
Voice input only works on Chrome/Edge. No fallback is specified for Firefox/Safari users. For the demo this is fine — demo on Chrome. Consider adding a small "(Chrome only)" label near mic buttons so it's not confusing.

**3. Snack suggestion re-call on every addition**
Each snack tap re-calls `/api/analyze` with the full updated meal list. This is slightly wasteful (we're re-estimating all meals, not just adding one snack's macros). For a demo app with low traffic this is fine. If Claude latency becomes noticeable, the optimization is to cache morning analysis macros and add snack macros client-side.

**4. Calendar month navigation**
PRD specifies current month only. No "previous month" navigation is in scope. If the learner wants to add back-navigation, it requires iterating `macroday_history` keys by month — a small addition but not in the current build plan.
