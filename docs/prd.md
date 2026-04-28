# MacroDay — Product Requirements

## Problem Statement

Gym-focused people who care about hitting their macro targets struggle with nutrition apps that demand constant logging throughout the day — a friction that leads to abandonment. MacroDay solves this with exactly two touchpoints: a morning planning check-in (what will you eat today?) and a night accountability check-in (what did you actually eat?). The result is a proactive, low-friction app that helps users stay on track without feeling surveilled by their own phone.

---

## User Stories

### Epic: Onboarding & Profile Setup

- As a first-time user, I want to set my fitness goal and daily macro targets so that the app knows what I'm working toward and can give me relevant feedback.
  - [ ] User sees three goal options: Bulking, Cutting, General Health
  - [ ] User can enter numeric targets for: calories, protein (g), fiber (g), carbs (g), fats (g)
  - [ ] After saving, a confirmation screen shows: "Profile saved. Your daily targets are set."
  - [ ] App immediately routes to the appropriate screen based on current time of day

- As a returning user, I want to update my macro targets or switch my goal so that the app reflects changes in my fitness phase.
  - [ ] A profile/settings screen is accessible at any time from any screen in the app
  - [ ] User can edit any of the five macro targets and their goal type
  - [ ] Changes take effect immediately for the current day's analysis

---

### Epic: Time-Aware Routing

- As a user opening the app, I want it to show me the right screen for the time of day so that I'm never confused about what I should be doing.
  - [ ] App detects user's timezone via device location
  - [ ] 5:00am–11:59am → Morning Check-In screen
  - [ ] 12:00pm–5:59pm → Afternoon screen: "You missed your morning check-in — want to log your meals for today anyway?"
  - [ ] 6:00pm–11:59pm → Night Check-In screen
  - [ ] 12:01am–4:59am → Sleep screen: mascot sleeping in bed, go-to-sleep punchline, "Come back tomorrow"
  - [ ] If user has already completed the morning check-in and reopens during the morning window → View Mode (not the input form again)

---

### Epic: Morning Check-In

- As a user planning my meals for the day, I want to enter what I'll eat for each meal so that the app can analyze my macro plan before the day starts.
  - [ ] Three separate input fields: Breakfast, Lunch, Dinner
  - [ ] Each field accepts typed text (e.g., "2 eggs, 100g oats, 1 banana") or voice input via a mic button
  - [ ] User can leave a meal field blank if skipping that meal
  - [ ] A "Analyze My Plan" submit button is visible once at least one field is filled

- As a user who just submitted my meal plan, I want to see a visual breakdown of my macros so that I know immediately how well my plan covers my daily targets.
  - [ ] App shows a ring/circle visualization for each of the five macros: calories, protein, fiber, carbs, fats
  - [ ] Each ring shows: percentage of daily goal covered by the plan + exact number remaining (e.g., "45g protein remaining")
  - [ ] Summary below rings shows the plan by meal: Breakfast / Lunch / Dinner
  - [ ] AI-generated feedback appears below the breakdown (e.g., "Your protein looks solid but you're 20g short on fiber")

- As a user who is short on a macro, I want specific snack suggestions so that I know exactly what to add to hit my targets.
  - [ ] App displays 2–3 snack suggestions tailored to the biggest macro gap (e.g., "A protein bar +25g protein" or "2 tbsp peanut butter +8g protein")
  - [ ] Each suggestion shows the macro contribution it would provide
  - [ ] Tapping a suggestion adds it to a "Snacks" section in the plan
  - [ ] Adding a snack immediately updates all five macro rings with the new numbers
  - [ ] User can remove a snack from the Snacks section, and rings revert accordingly

---

### Epic: Afternoon Check-In (Missed Morning)

- As a user who missed the morning check-in, I want to still log my meals in the afternoon so that I don't lose the day entirely.
  - [ ] Opening the app between 12:00pm–5:59pm shows: "You missed your morning check-in — want to log your meals for today anyway?"
  - [ ] If yes → user gets the full Morning Check-In form: Breakfast, Lunch, Dinner fields (voice or text), same macro analysis, same rings, AI feedback, and snack suggestions
  - [ ] If no → app shows a "See you tonight!" message and is idle until the night window opens at 6pm

---

### Epic: Mid-Day View (Returning to App After Logging)

- As a user who already logged their morning plan, I want to view it and update it if my meals changed so that my analysis stays accurate.
  - [ ] Opening the app during the morning window after already logging → View Mode
  - [ ] View Mode shows the submitted meal plan and current macro rings (read-only by default)
  - [ ] A prompt appears: "Hey, you're back! Want to update your meals?"
  - [ ] Tapping "Update" unlocks the meal fields for editing; re-submitting re-runs the analysis

---

### Epic: Night Check-In

- As a user ending my day, I want to confirm what I actually ate so that the app can tell me how I did against my targets.
  - [ ] Night check-in presents two clear paths: "I mostly followed my plan" (Path A) and "My day went differently" (Path B)

**Path A — Followed the Plan:**
  - [ ] App shows each logged item as a tick-box: Breakfast, Lunch, Dinner, and any Snacks
  - [ ] User ticks each item they actually ate as planned
  - [ ] For any unticked item, app asks: "What did you actually eat?" (text or voice) OR "Did you skip this meal?"
  - [ ] If skipped: affirmation card with mascot — "Sounds like a busy day! Have a glass of water or a refreshing juice" — report updated to reflect skip
  - [ ] After all items are resolved → End-of-Day Summary

**Path B — Day Went Differently:**
  - [ ] User enters what they actually ate for the day (text or voice per meal)
  - [ ] App stores this as the final version of the day's meals
  - [ ] App analyzes actual intake vs. daily targets → End-of-Day Summary

- As a user who never logged a morning plan and opens the app at night, I want to still log my day so that I don't lose the data entirely.
  - [ ] App detects no morning log exists for today
  - [ ] Shows: "You didn't plan today — want to log what you actually ate?"
  - [ ] An "it's okay" card with the mascot encourages them to log anyway
  - [ ] User enters meals eaten (text or voice) → App analyzes vs. targets → End-of-Day Summary

---

### Epic: End-of-Day Summary

- As a user finishing my night check-in, I want to see exactly how I did against my goals so that I feel the satisfaction of hitting them or get motivated for tomorrow.
  - [ ] Summary shows final macro rings for all five macros: actual intake vs. daily target with exact numbers
  - [ ] If all goals met → Celebration card with mascot: "You did it! Goals hit today."
  - [ ] If goals not fully met → Encouragement card with mascot showing exact numbers: "You got X% of your protein goal. Fresh start tomorrow."
  - [ ] If still short on a macro at night → Option shown: "Want a suggestion to close the gap tonight?" or "Move on to tomorrow"
  - [ ] Tapping the suggestion option shows 1–2 items they could still eat to hit the target

---

### Epic: Calendar & Streak

- As a returning user, I want to see which days I hit my goals so that I can visualize my consistency over time.
  - [ ] A calendar view is accessible from the main screen
  - [ ] Each day is marked: ✓ (≥90% of all macro goals hit), ✗ (<90% on any macro), or blank (no data logged)
  - [ ] A streak counter shows current consecutive days with all goals completed (e.g., "4-day streak")
  - [ ] Calendar and streak data persists locally across browser sessions
  - [ ] If browser data is cleared, calendar resets — acceptable for the demo
  - [ ] Calendar defaults to showing the current month

---

### Epic: Mascot & App Character

- As a user interacting with emotional moments in the app, I want a consistent character to deliver messages so that the app feels warm and encouraging rather than clinical.
  - [ ] A single mascot character (designed in Canva, provided as PNG/SVG asset) appears on all card moments: celebration, affirmation (skipped meal), it's okay (no morning log), encouragement (goals not met), go-to-sleep screen
  - [ ] Mascot is illustrated holding or presenting each card
  - [ ] On the sleep screen: mascot shown in a bed, centered on screen, with a go-to-sleep punchline

---

## What We're Building

A web app with five functional screens, fully working end-to-end:

1. **Setup / Profile** — Goal selection (Bulking / Cutting / General Health) + five macro target fields (calories, protein, fiber, carbs, fats). Editable at any time.
2. **Morning Check-In** — Three meal fields (voice or text), macro ring analysis for all five macros, interactive snack suggestions that update the rings live. Also accessible via the Afternoon path if morning was missed.
3. **Mid-Day View** — Read-only view of the logged plan with option to update meals.
4. **Night Check-In** — Tick-box path (Path A) or re-entry path (Path B), handles skipped meals and the no-morning-log edge case, resolves to End-of-Day Summary with celebration or encouragement card.
5. **Calendar View** — Monthly calendar with ✓/✗ marks per day and a streak counter.

Plus time-aware routing across all four time windows (morning / afternoon / night / sleep screen) and a consistent mascot character across all emotional touchpoints.

---

## What We'd Add With More Time

- **Photo / image macro analysis** — User photographs a meal, AI estimates macros from the image. Requires a vision API and significantly more build time.
- **Post-workout recipe flow** — Dedicated UI triggered after a workout: tired + need protein fast. Partially covered by snack suggestions but not the full dedicated experience.
- **Sweet treat / dessert suggestions** — Macro-appropriate dessert recommendation at night. Fun but not core to the demo loop.
- **Push notifications** — Morning reminder at 8am, night reminder at 8pm. High real-world value, out of scope for demo.
- **Multi-day macro averaging** — "You've been low on fiber all week" type insights. Needs history analysis — better as v2.
- **Multi-month calendar history** — Scroll back through previous months. Current build shows current month only.

---

## Non-Goals

- **Photo/image macro analysis** — Requires a vision API and significant extra build time. Explicitly cut.
- **Social features, gamification, leaderboards** — MacroDay is a personal tool, not a social network.
- **Workout logging or exercise tracking** — This is a nutrition app. Fitness tracking is a separate product.
- **User authentication / accounts** — No login, no cloud sync. Local storage only. Demo, not a production app.
- **Real-time sync across devices** — Data does not follow the user across browsers or devices. Acceptable for the hackathon.

---

## Open Questions

- **Mascot asset** — Amulya will design the mascot in Canva and provide it as a PNG or SVG file dropped into the project folder. Needed before /build. *(Resolved: close enough macro accuracy is fine; mascot asset to be provided before build starts.)*
