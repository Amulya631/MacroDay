# MacroDay — Daily Nutrition Planner for Gym-Focused People

## Idea
A low-friction daily nutrition planner that gives gym-goers two simple touchpoints a day — a morning meal check-in and a night accountability log — so they can hit their protein, fiber, and calorie targets without constantly opening an app to log meals.

## Who It's For
Gym-focused people who care about macros and muscle gain. They work out, they know protein timing matters, and they want to end every day feeling satisfied — not guilty about what they ate. They've tried apps like MyFitnessPal but hate the constant friction of logging every single meal. They want the app to do the analysis for them, not make them do data entry all day.

## Inspiration & References
- **Welling** (https://www.welling.ai) — closest in spirit; shows you remaining macros for the day. MacroDay goes further by being planning-first (you tell it your plan upfront) rather than logging-first.
- **Calite AI** — adapts suggestions based on your day's context. The "coaching" framing is right; the constant check-ins are not.
- **Key differentiator:** Most nutrition apps are reactive (log what you ate). This app is proactive (plan what you'll eat, get smart feedback immediately, then check in once at the end).

## Goals
- Help gym-focused users hit their daily macro targets (protein, fiber, calories) with minimal friction
- Make healthy eating feel achievable and non-punishing — missing a goal isn't failure, it's data
- Build a clean, impressive-looking app that demonstrates end-to-end AI integration
- Prove the concept: two touchpoints a day is enough to stay on track

## What "Done" Looks Like
A working web app with three core screens:

**1. Setup / Profile**
User sets their goal: **Bulking**, **Cutting**, or **General Health**. Based on that goal, they enter their daily macro targets: calories, protein (g), fiber (g). This shapes both the AI's feedback tone and the snack/meal suggestions throughout the day.

**2. Morning Check-In**
User types what they're planning to eat for breakfast, lunch, and dinner (with portion sizes / gram amounts). App analyzes the plan against their targets and shows:
- Visual macro breakdown (calories, protein, fiber — how much of the goal this plan covers)
- AI feedback: "Your protein looks solid but you're low on fiber — here are 2-3 snack ideas to close the gap"
- Snack suggestions that are macro-appropriate for their remaining targets

**3. Night Check-In**
Two paths:
- **Followed the plan:** Simple tick-box confirmation for each meal
- **Didn't follow the plan:** User enters what they actually ate + the macros for each item (manual entry). App uses those numbers to analyze vs. daily targets.
- Either way: end-of-day summary showing goal completion. If they hit it — celebration. If they didn't — "You got X% of your protein goal. No stress — fresh start tomorrow."

**Frontend feel:** Clean, modern health/wellness aesthetic. Bold typography for macro numbers. Progress rings or bars for protein/fiber/calories. Feels motivating, not clinical. This is what wins over judges.

## What's Explicitly Cut
- **Photo/image macro analysis** — would require a vision API integration and significant build time. Cut for now; can be a v2 feature.
- **Post-workout specific recipe flow** — the insight is right (tired + need protein fast) but the dedicated workout-triggered UI adds complexity. Snack suggestions from morning check-in partially cover this.
- **Sweet treat / dessert suggestions** — good idea, not core to the demo loop.
- **Social features, streaks, gamification** — out of scope entirely.
- **Workout logging or exercise tracking** — this is a nutrition app, not a fitness tracker.

## Loose Implementation Notes
- **Frontend:** React (or similar). Clean component structure: Setup → Morning → Night. Health/wellness visual design is a priority.
- **Backend:** Python (Amulya's strength). Simple API endpoints for the three screens.
- **AI layer:** Claude API for meal evaluation, macro gap analysis, and snack suggestions. Input = meal descriptions + gram amounts + daily targets. Output = macro breakdown + feedback + suggestions.
- **Macro calculation:** User enters meals with portion sizes in grams/oz. App uses AI or a nutrition lookup to estimate macros from descriptions. No photo analysis.
- **Deployment:** GCP Cloud Run (Amulya's comfort zone).
- **Data:** Simple in-memory or local storage for the demo. No auth required for hackathon.
