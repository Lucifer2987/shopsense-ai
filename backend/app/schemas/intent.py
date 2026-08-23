from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class ItemPayload(BaseModel):
    name: str
    quantity: float = Field(gt=0)
    unit: str = "piece"


class SearchConstraints(BaseModel):
    max_price: Optional[float] = None
    min_price: Optional[float] = None
    brand: Optional[str] = None
    organic: Optional[bool] = None
    category: Optional[str] = None


class ContextData(BaseModel):
    type: str
    people: Optional[int] = None
    date: Optional[str] = None
    budget: Optional[float] = None


# --- Per-intent schemas ---

class AddItemIntent(BaseModel):
    intent: Literal["ADD_ITEM"]
    items: list[ItemPayload]


class RemoveItemIntent(BaseModel):
    intent: Literal["REMOVE_ITEM"]
    name: str


class UpdateQuantityIntent(BaseModel):
    intent: Literal["UPDATE_QUANTITY"]
    name: str
    quantity: float = Field(gt=0)
    unit: str = "piece"


class SearchProductIntent(BaseModel):
    intent: Literal["SEARCH_PRODUCT"]
    query: str
    constraints: SearchConstraints = Field(default_factory=SearchConstraints)


class SetBudgetIntent(BaseModel):
    intent: Literal["SET_BUDGET"]
    budget: float = Field(gt=0)


class SetPreferenceIntent(BaseModel):
    intent: Literal["SET_PREFERENCE"]
    preference: str


class CreateContextIntent(BaseModel):
    intent: Literal["CREATE_CONTEXT"]
    context: ContextData


class SimpleIntent(BaseModel):
    intent: Literal[
        "GET_RECOMMENDATIONS",
        "OPTIMIZE_BASKET",
        "SHOW_LIST",
        "CLEAR_LIST",
        "UNKNOWN",
    ]
    budget: Optional[float] = None
    raw: Optional[str] = None


AnyIntent = (
    AddItemIntent
    | RemoveItemIntent
    | UpdateQuantityIntent
    | SearchProductIntent
    | SetBudgetIntent
    | SetPreferenceIntent
    | CreateContextIntent
    | SimpleIntent
)


def parse_intent(raw: dict[str, Any]) -> AnyIntent:
    intent_type = raw.get("intent", "UNKNOWN")
    schema_map: dict[str, type] = {
        "ADD_ITEM": AddItemIntent,
        "REMOVE_ITEM": RemoveItemIntent,
        "UPDATE_QUANTITY": UpdateQuantityIntent,
        "SEARCH_PRODUCT": SearchProductIntent,
        "SET_BUDGET": SetBudgetIntent,
        "SET_PREFERENCE": SetPreferenceIntent,
        "CREATE_CONTEXT": CreateContextIntent,
    }
    schema = schema_map.get(intent_type, SimpleIntent)
    return schema.model_validate(raw)
