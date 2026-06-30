# Palette — full_context.md

## Vision

**One sentence:** Palette is a flavor-space engine that lets café owners invent a complete, original drink in seconds, built mathematically from whatever ingredients they actually have on hand right now.

**One paragraph:** Café owners don't run out of recipes — they run out of time. Every morning brings small operational chaos: a missing ingredient, a surplus item about to expire, a stale seasonal menu, a competitor's buzzy new drink. The instinct is always the same — "I need something new, today, that uses what I have." Today that means Googling recipes, guessing ratios, or doing nothing. Palette replaces guesswork with a flavor-space model: sweetness, acidity, body, bitterness, and temperature plotted as real coordinates. Instead of retrieving a recipe, Palette computes one — plotting a new drink into the open space between existing flavors, constrained by exactly what's in stock and what must be used. The owner gets a complete, nameable, sellable drink with ratios, build steps, and a cost estimate, generated live, that they could hand to a barista before the next customer walks in.

## Problem

Specific scenario: it's 7am, the oat milk delivery didn't arrive, and three drinks on the specials board can't be made. Or: there's a surplus of brown sugar syrup expiring Friday and no plan to use it. Or: the fall menu has gone stale and a competitor just launched something that got attention online. In every case, the owner needs a genuinely new drink — not a substitution, not a Pinterest recipe — built around their actual constraints, and they need it in minutes, not after-hours R&D. Independent café margins are thin enough that wasted inventory and a stale menu are not cosmetic problems; they're lost revenue and lost differentiation against chains with full R&D teams.

## Target Users

**Primary: independent café owner / shift manager.** Currently handles this by either skipping the problem (selling fewer items, wasting inventory) or doing informal trial-and-error during slow hours — time they don't reliably have. They are not a developer and not interested in "AI" as a concept; they want a fast, concrete answer to "what do I make with this."

Explicitly not building for: the customer (ordering experience) or the barista-as-executor (operational logistics) — both diffuse the demo and the rubric notes that targeting all users at once reads as "no user."

## User Journey

1. Owner opens Palette during a constraint moment (missing ingredient, surplus item, stale menu).
2. Enters available ingredients/base spirits-or-syrups, flags anything out of stock, flags anything that must be used.
3. Optionally sets a constraint (no dairy, iced only, under $1.20 cost).
4. Palette computes the current flavor-space map of the café's existing menu, identifies the open gap matching the constraints, and plots a new drink into that gap.
5. Owner sees the generated drink: name, flavor-space position relative to existing menu, full build (ratios + steps), and estimated cost.
6. Owner tweaks one constraint live (e.g., "make it less sweet") and watches the drink and its position on the chart update in real time.
7. Owner exports/prints the recipe card.

## Core Features (at submission)

- Ingredient + constraint input (manual entry, no inventory integration needed for demo)
- Flavor-space computation: each ingredient mapped to coordinates (sweetness, acidity, body, bitterness, temperature)
- Live flavor-space visualization (scatter/radar chart) showing existing menu items plus the new generated drink
- AI-generated complete drink: name, ratios, build steps, short tasting-note description
- Cost estimate per drink based on entered ingredient costs
- One-click regenerate/tweak that visibly moves the point on the chart and updates the recipe

## Key Differentiators

- Not a recipe database or lookup tool — every drink is computed fresh from constraints, with the math visible on screen, not hidden behind a chat response.
- Built for the operational decision-maker, not the consumer — directly addresses a pain judges can picture (a real café owner at 7am), which the breakdown identifies as the more winnable angle.
- The flavor-space chart turns an LLM call into something that *looks* like an instrument rather than a chatbot, which is the single biggest lever for the "AI as core, not a feature" judging signal.

## Technical Overview

- Frontend: React single-page app, ingredient input form, live chart (recharts), recipe card display.
- Backend: lightweight API layer (FastAPI or serverless function) that constructs a structured prompt encoding the flavor-space model and constraints, calls an LLM with a forced structured-JSON output (coordinates + recipe), and returns it to the frontend.
- Key technical bet: the flavor coordinates are not just decorative — they are part of the actual prompt/output contract, so the chart and the recipe are always in sync and regenerate together.

## Demo Flow

See Phase 4 demo script in this document set — owner enters real constraint, chart renders existing menu, gap appears, drink is generated into the gap, one live tweak reshapes both chart and recipe.

## Success Metrics

**Technical:** flavor-space generation and chart render in under 3 seconds; regeneration on tweak feels instant (<2s); zero broken states during the live demo.

**Product/judging:** judges can articulate, unprompted, what Palette does and who it's for after the 90-second demo; at least one judge reacts visibly to the live chart re-plotting; the recipe output looks shippable, not like a JSON dump.

## Future Expansion

- Real inventory integration (POS/supplier feeds) so constraints populate automatically instead of manual entry.
- A "seasonal menu refresh" mode that proposes a full coordinated specials board, not just one drink, balanced across the flavor space.
- Customer-facing version that lets a café publish "today's invented drink" as a limited-time signature item, turning the operational tool into a marketing one.
