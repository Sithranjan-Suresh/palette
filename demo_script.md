# Palette — Phase 4: Demo Design

## Demo Hook (first 15 seconds)
Open not on the app, but on the problem: "It's 7am. The oat milk delivery didn't show up. Three drinks on this café's menu can't be made today — and the owner has four minutes before the rush starts." Then cut to the screen: "This is Palette. It doesn't look up a recipe. It computes one."

## Demo Flow (full ~2:15 version — see condensed 90s cut below if time is tight)
1. Show the baseline menu already plotted on the flavor-space chart — a handful of existing drinks as points.
2. Enter today's real constraint live: oat milk out of stock, surplus brown sugar syrup must be used, no dairy. As the constraint is typed, the dashed "computed gap" zone visibly updates on the chart *before* anything is generated — narrate: "That dashed box isn't decoration. It's a real grid search running in plain Python, finding the part of this menu's flavor space nothing covers yet — before the AI is ever called."
3. Hit generate — narrate while it computes: "It's not picking from a list. It's inventing a drink constrained to land inside that computed box." New point appears on the chart, visibly inside the dashed zone. Recipe card renders: name, ratios, steps, tasting note, and cost.
4. Point at the cost line: "And the cost isn't a guess either — type in what you pay per ingredient" *(enter a couple of real prices)* "and watch it relabel itself 'Computed' instead of 'Estimated.' If you don't have prices handy, it falls back to a bundled reference price table — real data, not the model making up a number."
5. Live tweak: click "less sweet." Watch the point move and the recipe update in place, in real time.
6. Click "+ Add to menu." Narrate: "This drink is now part of the café's real menu — saved on this device, and the *next* gap computation accounts for it, so the menu actually grows instead of resetting every time." (Optional, if time allows: reload the page to show it's still there.)
7. Click "Refresh whole menu" with the count set to 4. While it computes: "This isn't four separate requests for the same thing — it's a coordinated batch. Each target is picked by a greedy farthest-point search that already knows about the other targets, so they spread across the space together, and each drink is told what the others in the batch are so it doesn't just invent the same drink four times." Chart shows 4 new points, each in its own zone, each a different color; four recipe cards render below.
8. Close on the recipe card (or the menu grid) as the literal end product: "This is what gets handed to the barista before the next customer walks in. Not a chatbot answer — a menu, computed."

## Wow Moments
- The chart populated with a real baseline menu before any AI is invoked (sets up "this models something real").
- The dashed target zone appearing and moving *before generation*, live, as constraints are typed — the math is visible before the AI does anything.
- The new point landing visibly inside the computed zone, not just visibly separate from the baseline (visual proof the computation actually drove the result, not just a coincidence).
- The cost line relabeling itself "Computed" the moment real prices are entered — proof the product practices what it pitches on a second, independent axis from the chart.
- The live tweak reshaping both the chart and the recipe simultaneously, with no reload.
- The "Refresh whole menu" moment — four genuinely different drinks, four different colored points spread across the chart, in one click. The second "wait, it does *that* too" beat.
- The recipe card looking like something that could be taped to an espresso machine tomorrow morning.

## Required Screens
- Input screen (ingredient/constraint entry, including the "Refresh whole menu" control)
- Chart + recipe combined view (single-drink mode — the screen judges should remember most)
- Chart + menu grid view (batch-refresh mode — the second beat)
- No separate "loading" screen needed beyond an inline spinner — don't build screens that don't serve the demo.

## User Journey (judge's experience)
Judge sees a relatable, specific morning-of-rush problem stated in one sentence → watches the computed target zone update live as constraints are typed → watches a real recipe appear inside that zone → watches the cost line prove itself with real prices → watches it change live on a single click → watches a whole coordinated menu refresh appear in one more click → leaves remembering a chart, a recipe card, and the fact that everything on screen was provably computed, not guessed.

## Judge Takeaways (exactly four)
1. This solves a real, specific operational problem a café owner actually has — not a hypothetical.
2. The AI is doing something visibly mathematical, not just retrieving a recipe from a template — and it's defensible on two independent axes (flavor-space gap, ingredient cost), not just one.
3. The output is immediately usable — this could be handed to a barista today.
4. This isn't a one-shot toy — drinks you keep become part of the real menu, and you can refresh the whole board at once, not just one drink at a time.

## Condensed 90-Second Cut (if time is tight — original single-drink flow only)

**[0:00–0:15]**
"It's 7am at a café. The oat milk delivery didn't show up. Three drinks on the specials board can't be made, and the owner has about four minutes before the morning rush starts. This is Palette — and it doesn't look up a recipe. It computes one."

**[0:15–0:35]**
"Here's today's actual menu, plotted by flavor — sweetness and body. The owner tells Palette what's missing: no oat milk, no dairy at all today, but there's a surplus of brown sugar syrup that needs to go before it expires." *(the dashed target zone updates live as the constraint is typed)*

**[0:35–0:55]**
"Palette finds the gap — the part of the flavor map this café's menu doesn't cover yet, computed by a real grid search, not the AI guessing — and invents a drink to fill it. Watch the point land inside that box." *(generate; point appears inside the dashed zone)* "A new point, computed live, with a full recipe: ratios, steps, even a cost — and that cost is real arithmetic from entered prices, not another guess."

**[0:55–1:15]**
"Say the owner wants it less sweet. One click." *(tweak triggers, point moves, recipe updates)* "Watch — the drink moves on the map, and the recipe updates with it, in real time. Same logic, new constraint."

**[1:15–1:30]**
"This is what gets handed to the barista before the next customer walks in. Not a chatbot answer. A drink — invented, mathematically, from exactly what's in the building today. That's Palette."

## Full 2:15 Script (word-for-word, includes cost-honesty, kept-menu, and batch-refresh beats)

**[0:00–0:15]**
"It's 7am at a café. The oat milk delivery didn't show up. Three drinks on the specials board can't be made, and the owner has about four minutes before the morning rush starts. This is Palette — and it doesn't look up a recipe. It computes one."

**[0:15–0:35]**
"Here's today's actual menu, plotted by flavor — sweetness and body. The owner tells Palette what's missing: no oat milk, no dairy at all today, but there's a surplus of brown sugar syrup that needs to go before it expires." *(the dashed target zone updates live as the constraint is typed)* "That box isn't decoration — it's a real grid search, running in plain Python, finding the part of this menu's flavor space nothing covers yet, before the AI is ever called."

**[0:35–0:55]**
"Now generate." *(point appears inside the dashed zone)* "Not a database lookup — a new point, landing exactly inside the computed box, with a full recipe: ratios, steps, tasting note. And the cost line isn't a guess either." *(enter real ingredient prices live)* "Watch it relabel itself 'Computed' instead of 'Estimated' the moment it has real numbers to work with."

**[0:55–1:10]**
"Say the owner wants it less sweet. One click." *(tweak triggers, point moves, recipe updates)* "The drink moves on the map and the recipe updates with it, in real time."

**[1:10–1:35]**
"Now — the owner keeps this one." *(click "+ Add to menu")* "It's part of the real menu now. Saved on this device. The *next* gap computation knows it's there — this isn't a toy that resets every time you refresh the page, it's a menu that actually grows."

**[1:35–2:00]**
"And sometimes you don't need one drink — you need to refresh the whole board." *(click "Refresh whole menu")* "This computes four coordinated gaps at once, each one aware of the others, so the menu spreads across the flavor space instead of clustering — four genuinely different drinks, one click." *(chart shows four new points, four colors, four recipe cards)*

**[2:00–2:15]**
"This is what gets handed to the barista before the next customer walks in. Not a chatbot answer. A menu — invented, mathematically, from exactly what's in the building today. That's Palette."
