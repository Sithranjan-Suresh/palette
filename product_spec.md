# Palette — product_spec.md

## Product Requirements (must be true at submission)

1. User can input a list of available ingredients (name + optional cost) through a simple form — no auth, no persistence required beyond session.
2. User can flag constraints: ingredients that are out of stock/unavailable, ingredients that must be used, and a free-text dietary/style constraint (e.g., "no dairy," "iced only").
3. System computes a flavor-space position (sweetness, acidity, body, bitterness, temperature) for at least 4–6 pre-seeded "existing menu" drinks, shown on the chart as a baseline.
4. On submit, system generates one new drink: name, full flavor-space coordinates, ratio list, numbered build steps, one-sentence tasting note, and estimated cost.
5. The new drink renders on the chart visibly distinct from the existing menu items (different color/marker), in the gap matching the constraints.
6. User can apply one live tweak (e.g., a slider or quick-select like "less sweet" / "more body") that triggers regeneration and visibly moves the point + updates the recipe card, without a full page reload.
7. Recipe output is displayed as a clean, printable card (name, build, cost, tasting note) — this is the literal demo end-state.
8. App runs reliably end-to-end with no required external account setup beyond the LLM API key (handled server-side).

## User Stories

**US-1.** As a café owner, I want to enter what's in stock and what's missing so that the system understands my real constraints, not a generic menu.
*Acceptance criteria:* form accepts free-text ingredient entries; out-of-stock and must-use flags are distinguishable in the UI; empty submission is blocked with a clear prompt.

**US-2.** As a café owner, I want to see my current menu plotted on a flavor map so that I understand where the gap is before the new drink appears.
*Acceptance criteria:* baseline menu items render on the chart before generation; axes are labeled in plain language (not raw technical terms); chart renders in under 2 seconds.

**US-3.** As a café owner, I want a complete, ready-to-use recipe generated from my constraints so that I can hand it to a barista immediately.
*Acceptance criteria:* output always includes name, ratios, numbered steps, cost estimate, tasting note; no output is ever just a list of ingredients with no method.

**US-4.** As a café owner, I want to tweak the result live (e.g., less sweet) so that I can refine the drink without starting over.
*Acceptance criteria:* tweak triggers a new generation in place; chart point animates/updates to new position; previous recipe is replaced, not stacked, to keep the screen demo-clean.

**US-5.** As a judge watching the demo, I want it to be visually obvious that the drink is computed, not retrieved, so that the AI feels central to the product.
*Acceptance criteria:* the chart and the recipe update together on every generation/tweak; no static/sample recipe ever appears identical across two different constraint sets in the demo run.

## Edge Cases

- No ingredients entered: block submission, prompt for at least 2–3 items.
- Constraint with no feasible drink (e.g., contradictory asks): system should still return a best-effort drink rather than an error state — never show a broken/empty result during a live demo.
- LLM response malformed/missing fields: backend validates structured output and retries once before falling back to a clean error message (never a crash or blank screen).
- Very long ingredient names or free-text constraints: truncate gracefully in UI, don't break chart layout.
- Regeneration spam (user tweaks repeatedly fast): debounce requests so chart doesn't flicker or send overlapping calls.

## Feature Priority

**P0 (demo-blocking):**
- Ingredient/constraint input form
- Flavor-space chart with baseline menu + generated drink
- AI generation producing structured recipe (name, ratios, steps, cost, tasting note)
- Live tweak/regenerate flow updating both chart and recipe

**P1 (strongly improves demo but not blocking):**
- Printable/styled recipe card visual polish — done
- Pre-seeded realistic baseline menu (so chart isn't empty on load) — done
- Cost estimate calculation from entered ingredient prices — done (`backend/app/costing.py`): deterministically parses each ratio's quantity and multiplies by the user's entered $/unit; the recipe card labels the result "computed" (from real prices) vs "estimated" (LLM guess, when pricing is incomplete) so the UI is never silently wrong about which one it's showing

**P2 (nice to have, cut first if time is short):**
- Multiple tweak options beyond one slider/quick-select
- Animation polish on chart transitions
- Export/download/share of recipe card
