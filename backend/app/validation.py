import json
import re

from pydantic import ValidationError

from app.groq_client import chat_json
from app.models import GeneratedDrink
from app.prompting import build_retry_prompt

BAD_UNIT_PATTERN = re.compile(r"\b(units?|parts?|portions?)\b", re.IGNORECASE)


class GenerationFailedError(Exception):
    """Raised when the LLM fails to produce valid JSON after one retry."""


class InvalidUnitsError(ValueError):
    """Raised when a ratio amount uses a non-physical unit (e.g. 'units', 'parts')."""


def _check_units(drink: GeneratedDrink) -> None:
    for ratio in drink.ratios:
        if BAD_UNIT_PATTERN.search(ratio.amount):
            raise InvalidUnitsError(
                f"Ratio amount '{ratio.amount}' for '{ratio.ingredient}' uses a "
                "non-physical unit."
            )


def _try_parse(raw: str) -> GeneratedDrink:
    data = json.loads(raw)
    drink = GeneratedDrink.model_validate(data)
    _check_units(drink)
    return drink


def generate_validated_drink(system_prompt: str, user_prompt: str) -> GeneratedDrink:
    """Call Groq, validate against GeneratedDrink (incl. real-world units), retry once."""
    raw = chat_json(system_prompt, user_prompt)
    try:
        return _try_parse(raw)
    except (json.JSONDecodeError, ValidationError, InvalidUnitsError):
        pass

    retry_prompt = build_retry_prompt(user_prompt)
    raw_retry = chat_json(system_prompt, retry_prompt)
    try:
        return _try_parse(raw_retry)
    except (json.JSONDecodeError, ValidationError, InvalidUnitsError) as exc:
        raise GenerationFailedError(
            "Model returned invalid JSON or unusable units twice; could not produce a drink."
        ) from exc
