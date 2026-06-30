"""Deterministic flavor-space gap computation.

This is the actual "math" behind Palette's pitch: a coarse grid search over the
2D sweetness/body plane (the same two axes rendered on the live chart) finds the
point that is farthest from every existing baseline-menu drink — the most
under-served region of the flavor space. This number is computed here, in plain
Python, before the LLM is ever called; the LLM is then instructed to land inside
the computed target window rather than asked to "find the gap" itself.

For the menu-refresh mode, the same farthest-point search runs iteratively: each
newly chosen target is folded into the point set before searching for the next
one (classic greedy farthest-point sampling), so a batch of N targets spreads
itself across the open space instead of clustering on the single best gap.
"""

import math

from app.models import MenuItem

GRID_STEP = 0.5
AXIS_MIN = 0.0
AXIS_MAX = 10.0
# Search is restricted to the interior of the axis range. Without this, an
# unweighted farthest-point search trivially picks the board corners (0 or 10)
# since corners are far from any cluster by construction — a real but useless
# "gap" no café would actually want. Clamping to the interior keeps the
# computed target inside the plausible flavor range.
SEARCH_MIN = 1.0
SEARCH_MAX = 9.0
TARGET_WINDOW = 1.5  # +/- range around the computed target the LLM should land in


class GapTarget:
    def __init__(self, sweetness: float, body: float, min_distance: float, considered: int):
        self.sweetness = sweetness
        self.body = body
        self.min_distance = min_distance
        self.considered = considered

    def as_dict(self) -> dict:
        return {
            "sweetness": self.sweetness,
            "body": self.body,
            "sweetness_range": [
                max(AXIS_MIN, self.sweetness - TARGET_WINDOW),
                min(AXIS_MAX, self.sweetness + TARGET_WINDOW),
            ],
            "body_range": [
                max(AXIS_MIN, self.body - TARGET_WINDOW),
                min(AXIS_MAX, self.body + TARGET_WINDOW),
            ],
        }


def _filter_by_temperature(menu: list[MenuItem], style_constraint: str | None) -> list[MenuItem]:
    if not style_constraint:
        return menu
    text = style_constraint.lower()
    wants_iced = "iced" in text or "cold" in text
    wants_hot = "hot" in text and not wants_iced
    if wants_iced:
        filtered = [m for m in menu if m.flavor.temperature == "iced"]
    elif wants_hot:
        filtered = [m for m in menu if m.flavor.temperature == "hot"]
    else:
        filtered = menu
    return filtered or menu


def _farthest_point(points: list[tuple[float, float]]) -> tuple[tuple[float, float], float]:
    """Grid search for the (sweetness, body) point with the greatest minimum
    Euclidean distance to every point already in `points`."""
    best_point = (5.0, 5.0)
    best_min_dist = -1.0

    steps = int((SEARCH_MAX - SEARCH_MIN) / GRID_STEP) + 1
    for i in range(steps):
        sweetness = SEARCH_MIN + i * GRID_STEP
        for j in range(steps):
            body = SEARCH_MIN + j * GRID_STEP
            if not points:
                min_dist = 0.0
            else:
                min_dist = min(math.hypot(sweetness - px, body - py) for px, py in points)
            if min_dist > best_min_dist:
                best_min_dist = min_dist
                best_point = (sweetness, body)

    return best_point, best_min_dist


def compute_gap_target(menu: list[MenuItem], style_constraint: str | None = None) -> GapTarget:
    """Farthest-point search over a coarse grid: the single point in
    (sweetness, body) space with the greatest minimum distance to any existing drink."""
    relevant = _filter_by_temperature(menu, style_constraint)
    points = [(m.flavor.sweetness, m.flavor.body) for m in relevant]
    (sweetness, body), min_dist = _farthest_point(points)

    return GapTarget(
        sweetness=sweetness,
        body=body,
        min_distance=round(min_dist, 2),
        considered=len(relevant),
    )


def compute_multi_gap_targets(
    menu: list[MenuItem], count: int, style_constraint: str | None = None
) -> list[GapTarget]:
    """Greedy farthest-point sampling: pick `count` targets that jointly spread
    across the open space, by folding each chosen target into the point set
    before searching for the next one."""
    relevant = _filter_by_temperature(menu, style_constraint)
    points = [(m.flavor.sweetness, m.flavor.body) for m in relevant]

    targets: list[GapTarget] = []
    working_points = list(points)
    for _ in range(max(1, count)):
        (sweetness, body), min_dist = _farthest_point(working_points)
        targets.append(
            GapTarget(
                sweetness=sweetness,
                body=body,
                min_distance=round(min_dist, 2),
                considered=len(relevant),
            )
        )
        working_points.append((sweetness, body))

    return targets
