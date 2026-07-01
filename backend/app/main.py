import asyncio
import os
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from pydantic import BaseModel

from app.baseline_menu import BASELINE_MENU
from app.costing import apply_computed_cost
from app.gap import compute_gap_target, compute_multi_gap_targets
from app.models import GenerationRequest, MenuItem, MenuRefreshRequest
from app.prompting import build_generate_prompt, build_menu_refresh_prompt
from app.groq_client import PaletteRateLimitError
from app.validation import GenerationFailedError, generate_validated_drink

app = FastAPI(title="Palette API")

# For a hackathon with no auth and no user-sensitive data, we can safely
# open CORS to all origins. Set ALLOW_ALL_CORS=true on Render to avoid
# having to manually update FRONTEND_ORIGIN every time Vercel changes
# your preview URL.
_allow_all = os.environ.get("ALLOW_ALL_CORS", "").lower() in ("true", "1", "yes")

if _allow_all:
    allow_origins = ["*"]
else:
    _default_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    _extra_origin = os.environ.get("FRONTEND_ORIGIN")
    allow_origins = _default_origins + ([_extra_origin] if _extra_origin else [])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=not _allow_all,  # credentials not compatible with wildcard origin
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


class GapTargetRequest(BaseModel):
    style_constraint: str | None = None
    extra_menu: list[MenuItem] = []


@app.post("/api/gap-target")
def gap_target(req: GapTargetRequest):
    combined_menu = BASELINE_MENU + req.extra_menu
    target = compute_gap_target(combined_menu, req.style_constraint)
    return target.as_dict()


@app.post("/api/generate")
def generate(req: GenerationRequest):
    combined_menu = BASELINE_MENU + req.extra_menu
    target = compute_gap_target(combined_menu, req.style_constraint)
    system_prompt, user_prompt = build_generate_prompt(req, combined_menu, target)
    try:
        drink = generate_validated_drink(
            system_prompt, user_prompt, req.out_of_stock, req.must_use
        )
    except PaletteRateLimitError:
        return JSONResponse(
            status_code=429,
            content={
                "error": "rate_limit",
                "detail": "Groq daily token limit reached. Resets at midnight UTC — try again then, or upgrade at console.groq.com.",
            },
        )
    except GenerationFailedError:
        return JSONResponse(
            status_code=502,
            content={
                "error": "generation_failed",
                "detail": "Couldn't generate a drink right now — please try again.",
            },
        )
    apply_computed_cost(drink, req.available_ingredients)
    return {"drink": drink, "gap_target": target.as_dict()}


_executor = ThreadPoolExecutor(max_workers=4)


@app.post("/api/menu-refresh")
async def menu_refresh(req: MenuRefreshRequest):
    combined_menu = BASELINE_MENU + req.extra_menu
    targets = compute_multi_gap_targets(combined_menu, req.count, req.style_constraint)

    generation_req = GenerationRequest(
        available_ingredients=req.available_ingredients,
        out_of_stock=req.out_of_stock,
        must_use=req.must_use,
        style_constraint=req.style_constraint,
    )

    loop = asyncio.get_running_loop()

    def generate_one(target):
        # batch_so_far diversity prompt is skipped in parallel mode — each target
        # already spreads spatially via greedy farthest-point search
        system_prompt, user_prompt = build_menu_refresh_prompt(
            generation_req, combined_menu, target, []
        )
        try:
            drink = generate_validated_drink(
                system_prompt, user_prompt, req.out_of_stock, req.must_use
            )
            apply_computed_cost(drink, req.available_ingredients)
            return {"drink": drink, "gap_target": target.as_dict()}
        except PaletteRateLimitError:
            return "rate_limit"
        except GenerationFailedError:
            return None

    results = await asyncio.gather(
        *[loop.run_in_executor(_executor, generate_one, t) for t in targets]
    )

    if any(r == "rate_limit" for r in results):
        return JSONResponse(
            status_code=429,
            content={
                "error": "rate_limit",
                "detail": "Groq daily token limit reached. Resets at midnight UTC — try again then, or upgrade at console.groq.com.",
            },
        )

    items = [r for r in results if r is not None]
    failed_count = len(results) - len(items)

    if not items:
        return JSONResponse(
            status_code=502,
            content={
                "error": "generation_failed",
                "detail": "Couldn't refresh the menu right now — please try again.",
            },
        )

    return {"items": items, "failed_count": failed_count}
