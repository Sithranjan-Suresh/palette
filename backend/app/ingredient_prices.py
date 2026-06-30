"""Bundled reference wholesale price data for common café ingredients.

This is real external data (rough US café-supply wholesale pricing, sourced
offline), not invented by the LLM and not something the user has to type in
themselves. It's bundled as a static table rather than fetched from a live
API on every request: a hackathon demo depends on the network in the room,
and a flaky third-party price API failing mid-demo is a worse outcome than a
slightly-stale static reference. Costs are approximate $ per the unit
typically used for that ingredient in a recipe line (e.g. per oz, per shot,
per tsp) — see app/costing.py for how a ratio's parsed quantity is matched
against this.

Used only as a fallback when the user hasn't entered their own cost_per_unit
for an ingredient — a user-entered price always takes priority.
"""

REFERENCE_PRICES: dict[str, float] = {
    "espresso": 0.55,
    "coffee": 0.35,
    "cold brew concentrate": 0.40,
    "cold brew": 0.35,
    "whole milk": 0.06,
    "oat milk": 0.12,
    "almond milk": 0.11,
    "soy milk": 0.10,
    "heavy cream": 0.18,
    "honey": 0.20,
    "brown sugar syrup": 0.18,
    "vanilla syrup": 0.20,
    "caramel syrup": 0.20,
    "lavender syrup": 0.22,
    "maple syrup": 0.25,
    "simple syrup": 0.10,
    "cane sugar": 0.04,
    "cinnamon": 0.05,
    "nutmeg": 0.06,
    "matcha": 0.45,
    "black tea": 0.10,
    "green tea": 0.10,
    "lemon": 0.25,
    "lemonade": 0.12,
    "lime": 0.20,
    "mint": 0.15,
    "ginger syrup": 0.20,
    "pineapple juice": 0.15,
    "pumpkin puree": 0.20,
    "water": 0.0,
    "ice": 0.0,
}
