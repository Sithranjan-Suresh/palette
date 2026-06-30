import json

from app.models import GenerationRequest, MenuItem

FLAVOR_MODEL_DESCRIPTION = """
Flavor-space model — every drink is a point in 5 dimensions, each scored 0-10:
- sweetness: 0 = no sweetness, 10 = dessert-level sweet
- acidity: 0 = flat/no tartness, 10 = sharply tart/acidic
- body: 0 = thin/watery mouthfeel, 10 = thick/heavy/creamy mouthfeel
- bitterness: 0 = no bitterness, 10 = intensely bitter
- temperature: either "hot" or "iced" (categorical, not a 0-10 scale)
"""

JSON_SCHEMA_DESCRIPTION = """
Return strictly a JSON object with this exact shape, no markdown fences, no commentary outside the JSON:
{
  "name": string,
  "flavor": { "sweetness": number, "acidity": number, "body": number, "bitterness": number, "temperature": "hot" | "iced" },
  "ratios": [ { "ingredient": string, "amount": string } ],
  "steps": [ string, ... ],
  "tasting_note": string,
  "estimated_cost": number
}
"""


def _serialize_menu(menu: list[MenuItem]) -> str:
    return json.dumps([m.model_dump() for m in menu], indent=2)


def build_generate_prompt(req: GenerationRequest, baseline_menu: list[MenuItem]) -> tuple[str, str]:
    system_prompt = (
        "You are Palette's flavor-space engine for an independent cafe. "
        "You invent one complete, original drink at a time by computing a position "
        "in a 5-axis flavor space, not by retrieving an existing recipe."
        + FLAVOR_MODEL_DESCRIPTION
        + JSON_SCHEMA_DESCRIPTION
    )

    available = ", ".join(
        f"{i.name}" + (f" (${i.cost_per_unit}/unit)" if i.cost_per_unit else "")
        for i in req.available_ingredients
    ) or "none specified"

    user_lines = [
        f"Existing baseline menu (for gap analysis):\n{_serialize_menu(baseline_menu)}",
        f"\nAvailable ingredients: {available}",
        f"Out of stock / must NOT use: {', '.join(req.out_of_stock) or 'none'}",
        f"Must use (use at least one of these): {', '.join(req.must_use) or 'none'}",
        f"Style constraint: {req.style_constraint or 'none'}",
    ]

    if req.tweak and req.previous_drink:
        user_lines.append(
            "\nThis is a TWEAK request, not a fresh invention. "
            f"Previous drink: {json.dumps(req.previous_drink.model_dump())}\n"
            f"Requested tweak: \"{req.tweak}\"\n"
            "Adjust the previous drink consistently with this tweak — keep the same "
            "general identity/name theme where reasonable, shift the flavor coordinates "
            "and recipe to reflect the tweak, do not invent an unrelated drink."
        )
    else:
        user_lines.append(
            "\nStep 1: Identify the most under-served region of the flavor space given "
            "the baseline menu and constraints above. "
            "Step 2: Invent one new drink that fills that gap, respecting all constraints "
            "(must avoid out-of-stock ingredients, must incorporate at least one must-use "
            "ingredient, must satisfy the style constraint)."
        )

    user_lines.append("\nReturn only the JSON object described in the system prompt.")
    user_prompt = "\n".join(user_lines)

    return system_prompt, user_prompt


def build_retry_prompt(user_prompt: str) -> str:
    return (
        user_prompt
        + "\n\nYour previous response was not valid JSON matching the required schema. "
        "Return only valid JSON now, with no markdown fences and no commentary."
    )
