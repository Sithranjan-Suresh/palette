import json

from pydantic import ValidationError

from app.groq_client import chat_json
from app.models import GeneratedDrink
from app.prompting import build_retry_prompt


class GenerationFailedError(Exception):
    """Raised when the LLM fails to produce valid JSON after one retry."""


def _try_parse(raw: str) -> GeneratedDrink:
    data = json.loads(raw)
    return GeneratedDrink.model_validate(data)


def generate_validated_drink(system_prompt: str, user_prompt: str) -> GeneratedDrink:
    """Call Groq, validate against GeneratedDrink, retry once on failure."""
    raw = chat_json(system_prompt, user_prompt)
    try:
        return _try_parse(raw)
    except (json.JSONDecodeError, ValidationError):
        pass

    retry_prompt = build_retry_prompt(user_prompt)
    raw_retry = chat_json(system_prompt, retry_prompt)
    try:
        return _try_parse(raw_retry)
    except (json.JSONDecodeError, ValidationError) as exc:
        raise GenerationFailedError(
            "Model returned invalid JSON twice; could not produce a drink."
        ) from exc
