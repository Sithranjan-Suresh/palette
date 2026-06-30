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


class GenerateResponse(BaseModel):
    drink: GeneratedDrink


class GenerateErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
