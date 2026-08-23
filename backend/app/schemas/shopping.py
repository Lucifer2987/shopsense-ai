from typing import Optional

from pydantic import BaseModel, Field


class CreateListRequest(BaseModel):
    name: str
    user_id: str


class AddItemRequest(BaseModel):
    product_id: str
    quantity: float = Field(gt=0)
    unit: str = "piece"


class UpdateItemRequest(BaseModel):
    quantity: Optional[float] = Field(default=None, gt=0)
    is_completed: Optional[bool] = None
