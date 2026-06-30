# Manual test log (local, against live Groq API)

- Baseline menu loads: OK.
- Fresh generate (oat milk out, brown sugar must-use, no dairy/iced): ~1.7s, valid JSON first try.
- Tweak path ("less sweet" on previous drink): ~1.0s, sweetness dropped 8→5, name/recipe adjusted consistently, point moves rather than jumping to an unrelated drink.
- Contradictory constraint ("sunset and thunderstorm", no ingredients given): best-effort drink returned, no crash/empty state.
- Two distinct constraint sets in one session produced clearly different drinks/flavor points (Creamy Vanilla Delight, hot/sweet vs. Minty Cold Brew Refresher, iced/tart) — no demo collision.
- Generation latency: ~1.0-1.7s per call, under the <3s (fresh) / <2s (tweak) success metrics from full_context.md.
- Frontend production build (`npm run build`) succeeds with no errors.
