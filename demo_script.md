# Palette — Phase 4: Demo Design

## Demo Hook (first 15 seconds)
Open not on the app, but on the problem: "It's 7am. The oat milk delivery didn't show up. Three drinks on this café's menu can't be made today — and the owner has four minutes before the rush starts." Then cut to the screen: "This is Palette. It doesn't look up a recipe. It computes one."

## Demo Flow
1. Show the baseline menu already plotted on the flavor-space chart — a handful of existing drinks as points.
2. Enter today's real constraint live: oat milk out of stock, surplus brown sugar syrup must be used, no dairy.
3. Hit generate — narrate while it computes: "It's not picking from a list. It's finding the gap in the menu and inventing something to fill it."
4. New point appears on the chart, visibly separate from the existing menu. Recipe card renders: name, ratios, steps, cost, tasting note.
5. Live tweak: click "less sweet." Watch the point move and the recipe update in place, in real time.
6. Close on the recipe card as the literal end product: "This is what the barista gets handed. Not a chatbot answer — a drink."

## Wow Moments
- The chart populated with a real baseline menu before any AI is invoked (sets up "this models something real").
- The new point landing visibly in open space, not overlapping an existing drink (visual proof it's not retrieval).
- The live tweak reshaping both the chart and the recipe simultaneously, with no reload.
- The recipe card looking like something that could be taped to an espresso machine tomorrow morning.
- (Stretch) Saying out loud what axis moved and why — "sweetness dropped, body went up to compensate" — making the math legible in one sentence.

## Required Screens
- Input screen (ingredient/constraint entry)
- Chart + recipe combined view (this is the screen judges should remember)
- No separate "loading" screen needed beyond an inline spinner — don't build screens that don't serve the demo.

## User Journey (judge's experience)
Judge sees a relatable, specific morning-of-rush problem stated in one sentence → watches constraints entered live → watches a chart they can read in 2 seconds → watches a real recipe appear → watches it change live on a single click → leaves remembering a chart and a recipe card, not a feature list.

## Judge Takeaways (exactly three)
1. This solves a real, specific operational problem a café owner actually has — not a hypothetical.
2. The AI is doing something visibly mathematical, not just retrieving a recipe from a template.
3. The output is immediately usable — this could be handed to a barista today.

## Ideal 90-Second Demo Script (word-for-word)

**[0:00–0:15]**
"It's 7am at a café. The oat milk delivery didn't show up. Three drinks on the specials board can't be made, and the owner has about four minutes before the morning rush starts. This is Palette — and it doesn't look up a recipe. It computes one."

**[0:15–0:35]**
"Here's today's actual menu, plotted by flavor — sweetness, body, acidity. The owner tells Palette what's missing: no oat milk, no dairy at all today, but there's a surplus of brown sugar syrup that needs to go before it expires."

**[0:35–0:55]**
"Palette finds the gap — the part of the flavor map this café's menu doesn't cover yet — and invents a drink to fill it. Not a database lookup. A new point, computed live, with a full recipe: ratios, steps, even a cost estimate."

**[0:55–1:15]**
"Say the owner wants it less sweet. One click." *(tweak triggers, point moves, recipe updates)* "Watch — the drink moves on the map, and the recipe updates with it, in real time. Same logic, new constraint."

**[1:15–1:30]**
"This is what gets handed to the barista before the next customer walks in. Not a chatbot answer. A drink — invented, mathematically, from exactly what's in the building today. That's Palette."
