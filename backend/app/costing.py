"""Deterministic recipe costing.

The LLM always returns its own guess at `estimated_cost` as part of the JSON
contract (engineering_spec.md requires the field to always be present). But a
guess is exactly what Palette's whole pitch argues against. When the user has
actually entered real $/unit prices for their ingredients, we throw the LLM's
number away and compute the true cost here instead: parse the leading quantity
out of each ratio's amount string (e.g. "1.5 pumps" -> 1.5) and multiply by
that ingredient's entered price. Water and ice are treated as free. The result
is only labeled "computed" when every ingredient in the recipe was priceable
this way — a partially-priced recipe keeps the LLM's estimate rather than
silently mixing real and guessed numbers into one misleading total.
"""

import re

from app.models import AvailableIngredient, GeneratedDrink

FREE_INGREDIENTS = {"water", "ice"}

# Fraction alternative MUST come first: regex alternation takes the first
# branch that matches at all (not the longest overall match), so against
# "1/4 tsp" a decimal-first pattern would match just "1" and silently drop
# the "/4", undercounting the quantity.
_QUANTITY_RE = re.compile(r"^\s*([0-9]+\s*/\s*[0-9]+|[0-9]+(?:\.[0-9]+)?)")


def _parse_quantity(amount: str) -> float | None:
    match = _QUANTITY_RE.match(amount)
    if not match:
        return None
    token = match.group(1).replace(" ", "")
    if "/" in token:
        num, den = token.split("/")
        try:
            return float(num) / float(den)
        except (ValueError, ZeroDivisionError):
            return None
    try:
        return float(token)
    except ValueError:
        return None


def _find_price(ingredient_name: str, available: list[AvailableIngredient]) -> float | None:
    name = ingredient_name.strip().lower()
    for item in available:
        item_name = item.name.strip().lower()
        if item_name == name or item_name in name or name in item_name:
            return item.cost_per_unit
    return None


def apply_computed_cost(drink: GeneratedDrink, available: list[AvailableIngredient]) -> None:
    """Mutates drink.estimated_cost / drink.cost_source in place when every
    ratio ingredient is priceable from the user's entered costs."""
    total = 0.0
    for ratio in drink.ratios:
        name = ratio.ingredient.strip().lower()
        if name in FREE_INGREDIENTS:
            continue

        quantity = _parse_quantity(ratio.amount)
        price = _find_price(ratio.ingredient, available)

        if quantity is None or price is None:
            return  # can't fully price this recipe — leave the LLM's estimate as-is

        total += quantity * price

    drink.estimated_cost = round(total, 2)
    drink.cost_source = "computed"
