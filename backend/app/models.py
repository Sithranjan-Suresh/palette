from typing import Literal, Optional

from pydantic import BaseModel, Field


class FlavorPoint(BaseModel):
    sweetness: float = Field(ge=0, le=10)
    acidity: float = Field(ge=0, le=10)
    body: float = Field(ge=0, le=10)
    bitterness: float = Field(ge=0, le=10)
    temperature: Literal["hot", "iced"]


class MenuItem(BaseModel):
    name: str
    flavor: FlavorPoint
    ingredients: list[str]


class RatioEntry(BaseModel):
    ingredient: str
    amount: str


class GeneratedDrink(BaseModel):
    name: str
    flavor: FlavorPoint
    ratios: list[RatioEntry]
    steps: list[str]
    tasting_note: str
    estimated_cost: float
    # Everything below is set server-side after generation, never by the LLM.
    # "computed" only when every ratio ingredient had a known real-world price
    # (see app/costing.py).
    cost_source: Literal["computed", "estimated"] = "estimated"
    # True when at least one ingredient's price came from the bundled
    # reference price table rather than a price the user actually entered.
    priced_with_reference_data: bool = False
    # Populated by app/validation.py's deterministic constraint checker
    # (not the LLM) when the recipe still violates out-of-stock/must-use
    # constraints after one corrective retry. Empty when fully compliant.
    constraint_warnings: list[str] = Field(default_factory=list)


class AvailableIngredient(BaseModel):
    name: str
    cost_per_unit: Optional[float] = None


class GenerationRequest(BaseModel):
    available_ingredients: list[AvailableIngredient]
    out_of_stock: list[str] = Field(default_factory=list)
    must_use: list[str] = Field(default_factory=list)
    style_constraint: Optional[str] = None
    tweak: Optional[str] = None
    previous_drink: Optional[GeneratedDrink] = None
    # Drinks the user has kept from earlier in this session — folded into the
    # baseline menu for gap computation and prompt context, so the menu the
    # system reasons about actually grows instead of resetting every call.
    extra_menu: list[MenuItem] = Field(default_factory=list)


class GenerateResponse(BaseModel):
    drink: GeneratedDrink


class GenerateErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None


class MenuRefreshRequest(BaseModel):
    available_ingredients: list[AvailableIngredient]
    out_of_stock: list[str] = Field(default_factory=list)
    must_use: list[str] = Field(default_factory=list)
    style_constraint: Optional[str] = None
    count: int = Field(default=4, ge=2, le=6)
    extra_menu: list[MenuItem] = Field(default_factory=list)


class GapTargetOut(BaseModel):
    sweetness: float
    body: float
    sweetness_range: list[float]
    body_range: list[float]


class MenuRefreshItem(BaseModel):
    drink: GeneratedDrink
    gap_target: GapTargetOut


class MenuRefreshResponse(BaseModel):
    items: list[MenuRefreshItem]
    failed_count: int = 0
