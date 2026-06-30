# Palette — engineering_spec.md

## Overall Architecture

```
[React SPA]
   |  (form input: ingredients, constraints, tweak actions)
   v
[Backend API - FastAPI]
   |  (builds structured prompt w/ flavor-space schema + constraints)
   v
[LLM API - Anthropic Claude, structured JSON output]
   |  (returns: drink name, flavor coords, ratios, steps, tasting note, cost est.)
   v
[Backend API] -- validates/repairs JSON --> [React SPA]
   |
   v
[Chart component] renders baseline menu + new point
[Recipe card component] renders structured recipe
```

No database required for the demo — baseline menu is a static seed file; session state lives in frontend memory. This keeps the stack thin and demo-reliable, which matters more than persistence for a non-cash, demo-judged hackathon.

## Data Model

No persistent DB needed. In-memory / static structures:

**FlavorPoint**
```
{
  sweetness: float (0-10),
  acidity: float (0-10),
  body: float (0-10),
  bitterness: float (0-10),
  temperature: "hot" | "iced"
}
```

**MenuItem (baseline, seeded statically)**
```
{
  name: string,
  flavor: FlavorPoint,
  ingredients: string[]
}
```

**GeneratedDrink**
```
{
  name: string,
  flavor: FlavorPoint,
  ratios: [{ ingredient: string, amount: string }],
  steps: string[],
  tasting_note: string,
  estimated_cost: float
}
```

**GenerationRequest (frontend -> backend)**
```
{
  available_ingredients: [{ name: string, cost_per_unit: float|null }],
  out_of_stock: string[],
  must_use: string[],
  style_constraint: string|null,
  tweak: string|null   // present only on regenerate
}
```

## API Design

**POST /api/baseline-menu**
- Returns the seeded baseline MenuItem[] for initial chart render.
- No auth required for demo.

**POST /api/generate**
- Body: GenerationRequest
- Response: `{ drink: GeneratedDrink }`
- Server builds a prompt that explicitly encodes the flavor-space schema (5 axes, ranges, definitions) and instructs the model to: (1) reason about where the baseline menu leaves a gap given the constraints, (2) invent one new drink filling that gap, (3) return strictly the JSON schema above, no prose outside JSON.
- Server validates the JSON against the GeneratedDrink shape; on validation failure, retries the call once with an added "your last response was invalid JSON, return only valid JSON" instruction; on second failure, returns a friendly error the frontend can render without crashing.

**POST /api/generate (tweak path)**
- Same endpoint, `tweak` field populated (e.g., "less sweet", "more body", "remove dairy"). Server includes the previous GeneratedDrink in the prompt context and instructs the model to adjust it consistently rather than inventing an unrelated drink, so the chart point moves rather than jumps to an unrelated region.

Auth strategy: none needed for the demo; LLM API key is held server-side as an environment variable, never exposed to the frontend.

## Frontend Architecture

**Component hierarchy**
```
<App>
  <IngredientForm />        // input ingredients, out-of-stock, must-use, style constraint
  <FlavorChart />           // baseline menu points + generated drink point
  <RecipeCard />            // structured recipe output
  <TweakControls />         // quick-select tweak buttons, triggers regenerate
</App>
```

**State management:** local React state (useState) at the App level is sufficient — no Redux/Context needed given the small surface area. State shape: `{ baselineMenu, generationRequest, generatedDrink, isLoading, error }`.

**Routing:** single page, no router needed.

**Chart implementation:** recharts scatter/radar chart. Use two of the five flavor axes (e.g., sweetness vs. body) as the primary 2D plot for visual clarity during a live demo; optionally a small radar chart on the recipe card shows all five axes for the selected drink. Keep the 2D scatter as the "wow" visual since it's easiest for judges to read in real time.

## Backend Architecture

**Service structure:** single FastAPI service, two route handlers (`/baseline-menu`, `/generate`), one prompt-construction module, one validation module.

**Key algorithm (prompt construction):**
1. Serialize baseline menu + constraints into the prompt.
2. Explicitly state the 5-axis flavor model with definitions and 0–10 ranges so the model's output is consistent and platable as real coordinates, not arbitrary numbers.
3. Instruct the model to identify the most under-served region of flavor-space given the constraint (e.g., "no dairy, must use brown sugar syrup, currently no iced item above 6 body") and invent a drink that fills it.
4. Force strict JSON-only output matching the GeneratedDrink schema; no markdown fences, no commentary.

**LLM integration point:** single call per generate/tweak action via the standard Anthropic Messages API; structured-output instruction embedded directly in the prompt (system or user message) since this is a single-shot generation, not a multi-turn agent — keep this simple deliberately, since reliability matters more than sophistication for a live demo.

**Validation module:** parse JSON, check required fields and numeric ranges (0–10) exist; on failure, retry once with a corrective instruction; on second failure, return a typed error object the frontend renders as a graceful "couldn't generate, try again" state rather than a blank screen or stack trace.

## External Integrations

- Anthropic API (Claude) for generation — the only external dependency. No sponsor APIs required per the hackathon's open format.
- No inventory/POS integration in scope for the demo (explicitly deferred to Future Expansion in full_context.md).

## Deployment Strategy

"Submitted and running" means: frontend deployed as a static build (Vercel/Netlify or equivalent), backend deployed as a small hosted service (Render/Railway/Fly or a serverless function) with the LLM API key set as an environment variable, baseline menu seed data bundled with the backend so no setup step is needed at demo time. Before the demo: pre-warm the baseline menu load, have one full working generation cached as a fallback screenshot/video in case of live network issues during judging — this is a safety net, not the primary demo path.
