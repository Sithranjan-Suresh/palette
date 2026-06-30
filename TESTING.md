# Manual test log (local, against live Groq API)

- Baseline menu loads: OK.
- Fresh generate (oat milk out, brown sugar must-use, no dairy/iced): ~1.7s, valid JSON first try.
- Tweak path ("less sweet" on previous drink): ~1.0s, sweetness dropped 8→5, name/recipe adjusted consistently, point moves rather than jumping to an unrelated drink.
- Contradictory constraint ("sunset and thunderstorm", no ingredients given): best-effort drink returned, no crash/empty state.
- Two distinct constraint sets in one session produced clearly different drinks/flavor points (Creamy Vanilla Delight, hot/sweet vs. Minty Cold Brew Refresher, iced/tart) — no demo collision.
- Generation latency: ~1.0-1.7s per call, under the <3s (fresh) / <2s (tweak) success metrics from full_context.md.
- Frontend production build (`npm run build`) succeeds with no errors.

## Post-redesign verification (hackathon-feedback follow-up)

- Deterministic gap computation (`backend/app/gap.py`): farthest-point grid search restricted to interior [1,9] range, confirmed it returns different, non-degenerate targets for "iced" (4.5, 9.0), "hot" (1.0, 1.0), and no constraint (9.0, 1.0) — initial unrestricted version collapsed to board corners (0/10) regardless of constraint, fixed by clamping search to the interior.
- Unit validation: ran 6+ varied generations (vegan/iced, low-cost/hot, must-use surplus, the exact demo_script.md scenario) — all ratio amounts came back as real bar units (oz, shots, pumps, tsp, dash), none of the previously-observed "1.5 units" nonsense. Validation module now rejects "unit(s)/part(s)/portion(s)" and retries once.
- Full generate→tweak chain re-verified after redesign: "more body" tweak increased body 8.0→9.0 (oat milk 4oz→6oz), name/identity preserved, gap_target consistent across both calls, latency ~1-1.8s.
- Frontend redesign (Fraunces/Inter/IBM Plex Mono, instrument-style flavor chart with live gap crosshair, paper recipe ticket, tag-chip inputs): `npm run build` succeeds, dev server transforms all new components (TagInput.jsx, redesigned FlavorChart/RecipeCard/IngredientForm/TweakControls) without error, page title/favicon confirmed updated to "Palette".
- **Limitation:** Chrome browser automation was unavailable in this environment, so the redesign was verified by build success + manual code review, not a visual click-through or screenshot. Recommend a quick visual pass before the actual demo.

## Live browser verification (via mcp__Claude_Preview, not just code review)

Actually drove the running app through `.claude/launch.json` + the preview tool — filled the real form, clicked through, read the live DOM — instead of relying on code review alone.

- Confirmed live in-browser: fonts load correctly, instrument chart and paper recipe ticket render exactly as designed, tag-chip inputs work, mobile breakpoint (375px) has no horizontal overflow.
- **Bug found and fixed live:** the gap-target crosshair was disappearing immediately after generation (`!generatedDrink` condition), meaning the proof moment — the generated point landing inside the dashed computed-gap zone — never actually appeared on screen. Fixed in `FlavorChart.jsx`; re-verified the point now visibly lands inside the zone after both fresh generation and tweaks.
- **Tooling note:** `preview_click()` did not reliably dispatch real `submit`/`click` events against `<button type="submit">` or plain buttons in this headless context — confirmed via `performance.getEntriesByType('resource')` showing zero `/api/generate` calls despite "successful" clicks. Worked around with `form.requestSubmit()` / direct `.click()` calls. This is a test-harness artifact, not an app bug — a real mouse click in a real browser fires normally.
- Full live demo_script.md scenario re-run end to end in-browser: generate → tweak ("more body") → point moved, radar reshaped, oat milk 4oz→5oz, cost $2.50→$2.75, name preserved. Validation error state for <2 ingredients confirmed rendering correctly in the new UI.

## Menu refresh (batch mode) verification

- `compute_multi_gap_targets` (greedy farthest-point sampling) confirmed via curl to produce well-spread, non-clustered targets, e.g. (4.5,9), (9,1), (9,9), (1,1) for a 4-item batch — not collapsed to one corner.
- First version of the diversity instruction was insufficient: with a 5-ingredient input, produced two pairs of near-duplicate drinks (e.g. "Cinnamon Oat Crunch" and "Espresso Brown Sugar Delight" sharing 3 of 4 ingredients) despite distinct names and chart positions.
- Strengthened the prompt to a hard "at most one shared ingredient per pair" constraint with explicit ingredient sets listed. Re-tested with a 5-ingredient input (still overlapped on the unavoidable espresso-based hot pair — a real combinatorial floor, not a prompt bug, when too few ingredients are given for the requested batch size) and a realistic 10-ingredient café input (oat chai latte / honey-mint / matcha cream / cold-brew lemon — fully distinct, 2 hot + 2 iced as requested, costs $2.25-$4.25, all real units), confirmed live through the browser via direct DOM inspection of the rendered cards.
- 4-item batch generation latency: ~4.7-5.6s total (4 sequential Groq calls, each carrying the growing batch context) — acceptable for a deliberate "refresh" action, distinct from the sub-2s single-generate/tweak path.
- Partial-failure resilience: `/api/menu-refresh` returns whatever items succeeded plus a `failed_count` rather than failing the whole batch if one generation can't be validated after retry — not yet exercised against an actual mid-batch failure (would require forcing a Groq error), but the code path returns the typed response either way.

## Deterministic cost computation (closing a named-but-unbuilt P1 from product_spec.md)

- Found: `product_spec.md` explicitly required "cost estimate calculation from entered ingredient prices" as P1, but this was never implemented — the LLM was always guessing the dollar figure itself, even when the user had entered real per-ingredient prices. This directly contradicted the product's "computed, not vibes" thesis on a measurable axis a sharp judge could catch.
- Implemented `backend/app/costing.py`: parses the leading quantity out of each ratio's amount string, multiplies by the user's entered `cost_per_unit` for that ingredient (water/ice treated as free), sums. Only overrides the LLM's `estimated_cost` and marks `cost_source: "computed"` when every non-free ingredient in the recipe was priceable; otherwise leaves the LLM's guess and marks `cost_source: "estimated"` — never silently blends real and guessed numbers into one misleading total.
- **Bug found and fixed during manual verification:** the quantity-parsing regex tried the decimal-number branch before the fraction branch in its alternation, so against an amount like "1/4 tsp" it matched only "1" and silently dropped the "/4" — undercounting that ingredient's contribution. Caught by hand-checking the computed total ($2.22) against manual arithmetic ($2.1875→$2.19) instead of trusting the number at face value. Fixed by reordering the alternation so the fraction pattern is tried first; re-verified against `2 shots`, `4 oz`, `1.5 oz`, `1/4 tsp`, `0.5 oz`, `1 wedge`, `3/4 cup`, `1/2 tsp` — all parse correctly, full recipe total now matches hand calculation exactly ($2.19).
- Confirmed live in-browser via mcp__Claude_Preview: with full ingredient pricing entered, the recipe card shows "Computed cost $2.19" with a "from your prices" badge; with partial/no pricing, falls back to "Estimated cost" with a neutral "no prices entered" badge — the UI never claims a guess is a computation.
