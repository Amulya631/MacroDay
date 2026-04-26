import os
import json
import anthropic
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/assets", StaticFiles(directory="assets"), name="assets")


@app.get("/")
async def root():
    return FileResponse("static/index.html")


class Meals(BaseModel):
    breakfast: Optional[str] = ""
    lunch: Optional[str] = ""
    dinner: Optional[str] = ""
    snacks: List[str] = Field(default_factory=list)


class Targets(BaseModel):
    calories: float
    protein: float
    fiber: float
    carbs: float
    fats: float


class AnalyzeRequest(BaseModel):
    meals: Meals
    targets: Targets
    mode: str  # "morning" or "night"
    mascot: str  # "milo" or "vilo"


@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")

    if request.mascot == "vilo":
        mascot_instructions = (
            "Write feedback and affirmation in the voice of Evil Vilo — a genuinely harsh, "
            "dismissive villain who uses ragebait. Be provocative. Make the user mad enough "
            "to prove you wrong. Examples: \"Pathetic. 40g short and it's not even noon.\" "
            "/ \"You call that a meal plan? My grandma bulks harder than this.\""
        )
    else:
        mascot_instructions = (
            "Write feedback and affirmation in the voice of Milo — a warm, encouraging "
            "fitness coach. Celebrate wins, frame gaps as opportunities, keep tone "
            "motivating and non-judgmental."
        )

    mode_instructions = (
        "Mode is 'morning' — analyze the planned meals for the day. Provide snack suggestions "
        "targeting the biggest macro gap."
        if request.mode == "morning"
        else "Mode is 'night' — analyze actual intake for the day. Provide an end-of-day affirmation."
    )

    snacks_text = ", ".join(request.meals.snacks) if request.meals.snacks else "none"
    meals_text = (
        f"Breakfast: {request.meals.breakfast or 'none'}\n"
        f"Lunch: {request.meals.lunch or 'none'}\n"
        f"Dinner: {request.meals.dinner or 'none'}\n"
        f"Snacks: {snacks_text}"
    )

    targets_text = (
        f"Calories: {request.targets.calories}, "
        f"Protein: {request.targets.protein}g, "
        f"Fiber: {request.targets.fiber}g, "
        f"Carbs: {request.targets.carbs}g, "
        f"Fats: {request.targets.fats}g"
    )

    system_prompt = f"""You are a nutrition analysis engine. Analyze meal descriptions and return structured JSON with macro estimates.

{mascot_instructions}

{mode_instructions}

Rules:
- If any meal description is too vague to estimate macros (e.g. "some food", "normal lunch", "some chicken"), set needs_clarification: true and write a specific clarification_message asking for portion sizes and preparation method.
- Return ONLY valid JSON. No prose outside the JSON object.
- Snack suggestions should target the biggest macro gap.
- Be accurate with macro estimates — use standard nutrition data.

Return this exact JSON structure:
{{
  "needs_clarification": false,
  "clarification_message": null,
  "macros": {{
    "calories": 0,
    "protein": 0,
    "fiber": 0,
    "carbs": 0,
    "fats": 0
  }},
  "gaps": {{
    "calories": 0,
    "protein": 0,
    "fiber": 0,
    "carbs": 0,
    "fats": 0
  }},
  "feedback": "string",
  "snack_suggestions": [
    {{ "name": "string", "macros": {{ "calories": 0, "protein": 0, "fiber": 0, "carbs": 0, "fats": 0 }} }}
  ],
  "affirmation": "string"
}}

If needs_clarification is true, all macro fields should be 0 and feedback/affirmation should be empty strings."""

    user_message = f"""Daily macro targets: {targets_text}

Meals:
{meals_text}

Analyze these meals against the targets and return the JSON response."""

    client = anthropic.Anthropic(api_key=api_key)

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1000,
        temperature=0.7,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    response_text = message.content[0].text.strip()

    # Strip markdown code fences if present
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(lines[1:-1]) if lines[-1] == "```" else "\n".join(lines[1:])

    result = json.loads(response_text)
    return result
