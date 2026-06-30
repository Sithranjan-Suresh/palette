"""Generation validation and closed-loop self-correction.

This is deliberately a different kind of capability from app/gap.py and
app/costing.py: those compute a number before the LLM runs. This module
verifies the LLM's own output against hard constraints AFTER it runs, using
plain Python (substring checks against the recipe's actual ingredient list —
not another LLM call asking "did you follow the rules?", which would just be
trusting the model to grade itself), and closes the loop by retrying once
with the specific, code-detected problems listed out. If the recipe still
violates a constraint after the corrective retry, it is not discarded
(per product_spec.md: never return a broken/empty result) — it's returned
with the violations attached so the UI can show an honest warning instead of
silently serving a recipe that, say, uses an out-of-stock ingredient.
"""

import json
import re

from pydantic import ValidationError

from app.groq_client import chat_json
from app.models import GeneratedDrink
from app.prompting import build_correction_prompt

BAD_UNIT_PATTERN = re.compile(r"\b(units?|parts?|portions?)\b", re.IGNORECASE)


class GenerationFailedError(Exception):
    """Raised when the LLM fails to produce valid, well-formed JSON after one retry."""


class _SoftValidationError(ValueError):
    """Internal: JSON parsed and matched the schema, but failed a check
    (bad units / unit mismatch) that should trigger a corrective retry."""


def _check_units(drink: GeneratedDrink) -> list[str]:
    issues = []
    for ratio in drink.ratios:
        if BAD_UNIT_PATTERN.search(ratio.amount):
            issues.append(
                f"Ratio amount '{ratio.amount}' for '{ratio.ingredient}' uses a "
                "non-physical unit (e.g. 'units', 'parts') instead of a real bar/kitchen unit."
            )
    return issues


def check_constraint_compliance(
    drink: GeneratedDrink, out_of_stock: list[str], must_use: list[str]
) -> list[str]:
    """Deterministic (no LLM) check: does the recipe actually avoid every
    out-of-stock ingredient, and actually use at least one must-use ingredient?"""
    ratio_text = " ".join(r.ingredient.lower() for r in drink.ratios)
    violations = []

    for item in out_of_stock:
        item_clean = item.strip().lower()
        if item_clean and item_clean in ratio_text:
            violations.append(f"Recipe uses '{item}', which was marked out of stock.")

    if must_use:
        if not any(item.strip().lower() in ratio_text for item in must_use if item.strip()):
            violations.append(
                f"Recipe doesn't use any of the must-use ingredients ({', '.join(must_use)})."
            )

    return violations


def _parse(raw: str) -> GeneratedDrink:
    data = json.loads(raw)
    drink = GeneratedDrink.model_validate(data)
    unit_issues = _check_units(drink)
    if unit_issues:
        raise _SoftValidationError("; ".join(unit_issues))
    return drink


def generate_validated_drink(
    system_prompt: str,
    user_prompt: str,
    out_of_stock: list[str] | None = None,
    must_use: list[str] | None = None,
) -> GeneratedDrink:
    """Call Groq, validate shape + units, then verify constraint compliance.
    Retries once (combining whatever issues were found) on any failure.
    If constraint violations remain after the retry, the drink is still
    returned with `constraint_warnings` populated rather than discarded."""
    out_of_stock = out_of_stock or []
    must_use = must_use or []

    raw = chat_json(system_prompt, user_prompt)
    try:
        drink = _parse(raw)
        violations = check_constraint_compliance(drink, out_of_stock, must_use)
        if not violations:
            return drink
        retry_issues = violations
    except (json.JSONDecodeError, ValidationError, _SoftValidationError) as exc:
        retry_issues = [str(exc)]

    retry_prompt = build_correction_prompt(user_prompt, retry_issues)
    raw_retry = chat_json(system_prompt, retry_prompt)
    try:
        drink = _parse(raw_retry)
    except (json.JSONDecodeError, ValidationError, _SoftValidationError) as exc:
        raise GenerationFailedError(
            "Model returned invalid JSON or unusable units twice; could not produce a drink."
        ) from exc

    drink.constraint_warnings = check_constraint_compliance(drink, out_of_stock, must_use)
    return drink
