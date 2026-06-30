import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.baseline_menu import BASELINE_MENU
from app.models import GenerationRequest, MenuItem
from app.prompting import build_generate_prompt
from app.validation import GenerationFailedError, generate_validated_drink

app = FastAPI(title="Palette API")

_default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
_extra_origin = os.environ.get("FRONTEND_ORIGIN")
allow_origins = _default_origins + ([_extra_origin] if _extra_origin else [])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "palette-api"}


@app.get("/api/baseline-menu")
@app.post("/api/baseline-menu")
def baseline_menu() -> list[MenuItem]:
    return BASELINE_MENU


@app.post("/api/generate")
def generate(req: GenerationRequest):
    system_prompt, user_prompt = build_generate_prompt(req, BASELINE_MENU)
    try:
        drink = generate_validated_drink(system_prompt, user_prompt)
    except GenerationFailedError:
        return JSONResponse(
            status_code=502,
            content={
                "error": "generation_failed",
                "detail": "Couldn't generate a drink right now — please try again.",
            },
        )
    return {"drink": drink}
