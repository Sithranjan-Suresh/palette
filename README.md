# Palette

**A flavor-space engine for cafés.** Enter what's actually in the building today — what's missing, what has to be used, what the drink needs to be — and Palette invents one complete, original drink in seconds: a name, a full build, a tasting note, a cost estimate, and a position on a live flavor map.

It doesn't look up a recipe. It computes one.

> It's 7am. The oat milk delivery didn't show up. Three drinks on the specials board can't be made, and the owner has about four minutes before the rush starts. This is the exact moment Palette is built for.

## How it works

Palette isn't a chatbot wrapper. The flavor-space gap a new drink should fill is **computed deterministically in Python** — a farthest-point grid search over the café's existing menu in (sweetness, body) space, finding the most under-served region — before the LLM is ever called. That computed target is then handed to the model as a hard constraint, not a suggestion, and rendered on the chart as a crosshair zone so the math is visible on screen, not hidden behind a response.

```
[ingredients + constraints]
        │
        ▼
[deterministic gap computation]  ──▶ shown live on the flavor chart as a target zone
        │
        ▼
[Groq · llama-3.3-70b-versatile, JSON mode]
        │  forced to land inside the computed target window
        ▼
[validation: schema + real-world units, retry once on failure]
        │
        ▼
[chart point + printable recipe ticket, both update together]
```

## Stack

- **Frontend:** React + Vite, recharts for the flavor map and radar chart
- **Backend:** FastAPI, Pydantic
- **LLM:** [Groq](https://groq.com) (`llama-3.3-70b-versatile`, JSON mode) — chosen for latency, since regeneration on every tweak needs to feel instant
- No database — the baseline menu is a static seed file; session state lives in the browser

## Running locally

**Backend**
```
cd backend
python -m venv .venv
.venv/Scripts/activate   # or source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env     # add your GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```
cd frontend
npm install
cp .env.example .env     # VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

Open the printed local URL. Enter at least two ingredients, optionally flag what's out of stock, what must be used, and a style constraint, then compute a drink. Use the tweak pills to regenerate in place.

## Menu refresh (batch mode)

Beyond inventing one drink, Palette can propose a coordinated set of 2-6 drinks that refresh the whole menu at once. This isn't N independent calls — `backend/app/gap.py`'s `compute_multi_gap_targets` runs greedy farthest-point sampling: each chosen gap target is folded into the point set before searching for the next one, so the targets jointly spread across the open flavor space instead of clustering on the single best gap. Each drink is then generated in sequence, with every prior drink in the batch passed into the next prompt under a hard diversity constraint (ingredient sets may overlap by at most one item), so the proposed menu doesn't just hit different chart coordinates — it's actually a different set of drinks, not the same drink renamed four times.

## Project docs

- [`full_context.md`](full_context.md) — vision, problem, target user
- [`product_spec.md`](product_spec.md) — requirements, user stories, edge cases
- [`engineering_spec.md`](engineering_spec.md) — architecture, API, data model
- [`demo_script.md`](demo_script.md) — the 90-second demo
- [`TESTING.md`](TESTING.md) — manual test log against the live Groq API
