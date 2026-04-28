# MacroDay

**Plan your macros in the morning. Check in once at night. Let Milo cheer you on — or let Evil Vilo roast you.**

> Built for gym-focused people who care about hitting their macro targets but hate logging every meal all day long.

🚀 **Live demo:** https://web-production-5c594.up.railway.app/

---

## The Problem

Most nutrition apps are reactive. You eat something, you log it, you feel guilty later. The friction of logging every meal throughout the day is exactly why people abandon these apps within a week — and the people who care most about macros (gym-goers chasing protein and fiber targets) are the ones who need a simple system, not a data-entry job.

## The Solution

Two touchpoints a day:

- **Morning** — Tell MacroDay what you're planning to eat. Get instant AI-powered macro analysis across all five macros (calories, protein, fiber, carbs, fats). Add snacks to close gaps and watch the rings update live.
- **Night** — Confirm what you actually ate. Followed your plan? Quick tick-box list. Day went sideways? Enter your actual meals. Either way, you get a real end-of-day summary.

Planning-first, not logging-first. You set an intention in the morning — which means better decisions all day, not just guilt at the end.

---

## Features

- **5 animated SVG macro rings** — real-time visual feedback for calories, protein, fiber, carbs, and fats
- **AI-powered analysis** — Claude Haiku reads your meal descriptions and calculates macros, gaps, and smart snack suggestions
- **Live snack updates** — add a suggested snack and all five rings update instantly
- **Voice input** — mic button on every meal field (Chrome, Web Speech API)
- **Time-aware routing** — app shows the right screen for the time of day automatically (morning / afternoon / night / sleep)
- **Night check-in** — Path A (tick-box confirmation) or Path B (full re-entry), with edge case handling for skipped mornings
- **End-of-day summary** — actual vs. target macro rings with celebration or encouragement card
- **Day rollover** — history written to localStorage, today resets automatically
- **Milo vs. Evil Vilo** — choose your mascot at setup. Milo is warm and encouraging. Vilo is a ragebait villain who will not be kind about your fiber intake.

---

## Mascot System

The mascot is a first-class feature, not an afterthought.

| Milo (Good) | Evil Vilo |
|---|---|
| Warm, encouraging, genuinely proud of you | Harsh, dismissive, ragebait energy |
| "Great job planning ahead — your protein is solid!" | "Embarrassing. You logged 'some chicken' and expect me to calculate your macros?" |

Both characters appear on every emotional moment: morning results, skipped meals, end-of-day summary, sleep screen. Choose your poison in the profile settings.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Python · FastAPI |
| Frontend | Vanilla HTML · CSS · JavaScript |
| AI | Claude Haiku (`claude-haiku-4-5-20251001`) |
| Storage | Browser localStorage |
| Voice | Web Speech API |
| Deployment | Railway |

Single-service architecture — FastAPI serves both the static frontend and the API. No CORS complexity, no separate frontend deployment.

---

## Running Locally

**1. Clone the repo**
```bash
git clone https://github.com/Amulya631/MacroDay.git
cd MacroDay
```

**2. Install dependencies**
```bash
pip install -r requirements.txt
```

**3. Set your API key**

Create a `.env` file in the project root:
```
ANTHROPIC_API_KEY=your-key-here
```
Get a key at [console.anthropic.com](https://console.anthropic.com).

**4. Start the server**
```bash
uvicorn main:app --reload
```

**5. Open the app**

Visit `http://localhost:8000` in Chrome. Voice input requires Chrome (Web Speech API).

---

## How the AI Works

All macro analysis runs through a single `POST /api/analyze` endpoint. The request includes:
- Meal descriptions (free text — "200g chicken breast, 150g rice")
- Daily macro targets from the user's profile
- Mode (`"morning"` or `"night"`)
- Mascot preference (`"milo"` or `"vilo"`)

Claude returns structured JSON:
```json
{
  "macros": { "calories": 1480, "protein": 112, "fiber": 18, "carbs": 160, "fats": 38 },
  "gaps": { "calories": 520, "protein": 38, "fiber": 7, "carbs": 20, "fats": 22 },
  "feedback": "Your protein is on track but fiber is noticeably short...",
  "snack_suggestions": ["Greek yogurt (200g) — +15g protein, +0g fiber", "..."],
  "affirmation": "Solid plan. Don't blow it at dinner.",
  "needs_clarification": false
}
```

Vague inputs (e.g. "some chicken") trigger `needs_clarification: true` — the app asks for specifics rather than guessing macros from incomplete descriptions.

---

## Project Structure

```
MacroDay/
├── main.py              # FastAPI app — serves frontend + API
├── requirements.txt
├── Procfile             # Railway deployment config
├── static/
│   ├── index.html       # Single-page app (all screens)
│   ├── style.css        # Health/wellness UI styling
│   ├── app.js           # Routing, profile, night check-in logic
│   └── analyze.js       # API calls, ring rendering, snack logic
├── assets/
│   ├── Milo_Good.png    # Good mascot
│   └── Vilo_Evil.png    # Evil mascot
└── docs/
    ├── scope.md
    ├── prd.md
    └── spec.md
```

---

## Architecture Decisions

**Single service, no CORS.** FastAPI serves both the static frontend and the `/api/analyze` endpoint from the same origin. The alternative — a separate frontend deployment — introduces CORS headers, two Railway services, and two deploy pipelines for a demo app. Not worth it. One `Procfile`, one environment variable, one URL.

**One endpoint, three modes.** Rather than separate routes for morning analysis, night analysis, and snack recalculation, everything goes through `POST /api/analyze` with a `mode` field. This keeps the frontend simple (one fetch wrapper) and means the prompt logic lives in one place — easier to tune Vilo's tone without hunting across multiple handlers.

**Vague input detection at the prompt level, not the application level.** When a user types "some chicken," the app doesn't try to parse or validate the input before sending it. Instead, the Claude prompt instructs the model to return `needs_clarification: true` with a specific message if it can't calculate macros with reasonable confidence. This is more robust than regex or keyword matching — Claude can catch edge cases that a rule-based validator would miss ("food from the gym" is vague; "leftover pasta" is ambiguous but probably workable).

**localStorage over a backend database.** For a personal-use demo with no auth requirement, localStorage is the right call. Zero infrastructure, zero latency, works offline, resets cleanly. The tradeoff — data doesn't follow you across devices — is acceptable for a hackathon. The data model is designed so that migrating to a real database later is straightforward: each key (`macroday_profile`, `macroday_today`, `macroday_history`) maps directly to what would be a user-scoped database record.

**SVG rings over CSS conic-gradient.** `stroke-dasharray` / `stroke-dashoffset` on SVG circles gives precise control over fill percentage and animates cleanly with CSS transitions. Conic-gradient is simpler to write but harder to animate and has inconsistent cross-browser rendering for partial fills. The SVG approach adds ~10 lines per ring but is rock-solid on every browser.

---

## What's Next (v2 Ideas)

- **Photo macro analysis** — photograph a meal, AI estimates macros from the image
- **Push notifications** — morning reminder at 8am, night reminder at 8pm
- **Multi-day insights** — "You've been low on fiber all week"
- **Post-workout mode** — dedicated high-protein suggestion flow triggered after a workout

---

Built with [Claude Code](https://claude.ai/code) · Powered by [Anthropic](https://anthropic.com)
