import os

from groq import Groq
from groq import RateLimitError as GroqRateLimitError

# Model choice: llama-3.3-70b-versatile — Groq-hosted, low-latency (LPU inference),
# strong structured/JSON output quality, supports response_format json_object.
# Picked over smaller 8b models for output reliability, and over other 70b-class
# options because it's Groq's current general-purpose flagship for this kind of task.
MODEL_NAME = "llama-3.3-70b-versatile"

_client: Groq | None = None


def get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY environment variable is not set. "
                "Set it in backend/.env (see .env.example)."
            )
        _client = Groq(api_key=api_key)
    return _client


class PaletteRateLimitError(Exception):
    """Raised when the Groq daily token limit is hit."""


def chat_json(system_prompt: str, user_prompt: str) -> str:
    """Call Groq chat completions with JSON mode, return raw JSON string content."""
    client = get_client()
    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.8,
        )
    except GroqRateLimitError as exc:
        raise PaletteRateLimitError(str(exc)) from exc
    return completion.choices[0].message.content
