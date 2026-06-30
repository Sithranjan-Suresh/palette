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
