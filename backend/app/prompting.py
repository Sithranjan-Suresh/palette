import json

from app.gap import GapTarget
from app.models import GeneratedDrink, GenerationRequest, MenuItem

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

Ratio amounts MUST use real, physical bar/kitchen units a barista can act on immediately —
fluid ounces (oz), milliliters (ml), pumps, teaspoons (tsp), tablespoons (tbsp), shots, dashes,
or whole counts (e.g. "1 wedge"). NEVER use vague non-physical units like "units", "parts",
"portions", or unitless numbers. Example of a GOOD amount: "1.5 oz", "2 pumps", "1/4 tsp".
Example of a BAD amount to avoid: "1.5 units".
"""


def _serialize_menu(menu: list[MenuItem]) -> str:
    return json.dumps([m.model_dump() for m in menu], indent=2)


def build_generate_prompt(
    req: GenerationRequest, baseline_menu: list[MenuItem], gap_target: GapTarget
) -> tuple[str, str]:
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
        gap_dict = gap_target.as_dict()
        user_lines.append(
            "\nA deterministic grid search over the existing menu has already computed the "
            "most under-served point in flavor space (farthest minimum distance from every "
            f"existing drink): sweetness={gap_dict['sweetness']}, body={gap_dict['body']} "
            f"(considering {gap_target.considered} relevant baseline drinks). "
            f"Your invented drink's sweetness MUST fall within {gap_dict['sweetness_range']} "
            f"and body MUST fall within {gap_dict['body_range']}. "
            "Invent one new drink whose flavor coordinates land inside that computed window, "
            "respecting all constraints (must avoid out-of-stock ingredients, must incorporate "
            "at least one must-use ingredient, must satisfy the style constraint)."
        )

    user_lines.append("\nReturn only the JSON object described in the system prompt.")
    user_prompt = "\n".join(user_lines)

    return system_prompt, user_prompt


def build_menu_refresh_prompt(
    req: GenerationRequest,
    baseline_menu: list[MenuItem],
    gap_target: GapTarget,
    batch_so_far: list[GeneratedDrink],
) -> tuple[str, str]:
    """Same contract as a single generate call, but for one item in a coordinated
    batch: the model is told about every drink already invented earlier in this
    same refresh so it doesn't propose a near-duplicate."""
    system_prompt = (
        "You are Palette's flavor-space engine for an independent cafe, currently "
        "proposing a coordinated batch of new drinks to refresh the menu — one drink "
        "at a time, each filling a different deterministically-computed gap, together "
        "spreading across the open flavor space rather than clustering."
        + FLAVOR_MODEL_DESCRIPTION
        + JSON_SCHEMA_DESCRIPTION
    )

    available = ", ".join(
        f"{i.name}" + (f" (${i.cost_per_unit}/unit)" if i.cost_per_unit else "")
        for i in req.available_ingredients
    ) or "none specified"

    gap_dict = gap_target.as_dict()
    user_lines = [
        f"Existing baseline menu:\n{_serialize_menu(baseline_menu)}",
        f"\nAvailable ingredients: {available}",
        f"Out of stock / must NOT use: {', '.join(req.out_of_stock) or 'none'}",
        f"Must use (use at least one of these): {', '.join(req.must_use) or 'none'}",
        f"Style constraint: {req.style_constraint or 'none'}",
    ]

    if batch_so_far:
        batch_summary = json.dumps(
            [
                {"name": d.name, "flavor": d.flavor.model_dump(), "ingredients": [r.ingredient for r in d.ratios]}
                for d in batch_so_far
            ],
            indent=2,
        )
        used_ingredient_sets = "; ".join(
            f"{d.name} = {{{', '.join(r.ingredient for r in d.ratios)}}}" for d in batch_so_far
        )
        user_lines.append(
            f"\nDrinks already proposed earlier in this same menu-refresh batch:\n{batch_summary}\n"
            "DIVERSITY REQUIREMENT (hard constraint, not a preference): your new drink's ingredient "
            f"set must share AT MOST ONE ingredient with any single already-proposed set above "
            f"({used_ingredient_sets}). Two drinks built from essentially the same base "
            "(e.g. both 'espresso + oat milk + brown sugar syrup', or both 'lemon + lemonade') are "
            "NOT acceptable even if their names and flavor numbers differ — pick a different "
            "available ingredient as the new drink's primary driver instead. If the available "
            "ingredient list is too short to avoid all overlap, minimize the overlap as much as possible "
            "and change the preparation method (e.g. steeped vs. shaken vs. layered) so the drinks are "
            "still meaningfully different to a barista and a customer."
        )

    user_lines.append(
        "\nA deterministic grid search has computed this drink's target gap (one of several "
        "targets computed together so the whole batch spreads across the flavor space): "
        f"sweetness={gap_dict['sweetness']}, body={gap_dict['body']}. "
        f"Your invented drink's sweetness MUST fall within {gap_dict['sweetness_range']} "
        f"and body MUST fall within {gap_dict['body_range']}. "
        "Invent one new drink whose flavor coordinates land inside that computed window, "
        "respecting all constraints (must avoid out-of-stock ingredients, must incorporate "
        "at least one must-use ingredient, must satisfy the style constraint)."
    )
    user_lines.append("\nReturn only the JSON object described in the system prompt.")

    return system_prompt, "\n".join(user_lines)


def build_retry_prompt(user_prompt: str) -> str:
    return (
        user_prompt
        + "\n\nYour previous response was not valid JSON matching the required schema, or "
        "used non-physical units (like 'units' or 'parts') in a ratio amount. "
        "Return only valid JSON now, with no markdown fences and no commentary, and make sure "
        "every ratios[].amount uses a real bar/kitchen unit (oz, ml, pump, tsp, tbsp, shot, dash, "
        "or a whole count like '1 wedge')."
    )
