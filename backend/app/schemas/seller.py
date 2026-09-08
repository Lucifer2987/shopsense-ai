from typing import Optional

from pydantic import BaseModel, Field, field_validator


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address.")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class CreateProductRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    category: str = Field(min_length=1)
    brand: Optional[str] = None
    price: float = Field(gt=0)
    unit: Optional[str] = None
    tags: Optional[list[str]] = None
    image_url: Optional[str] = None
    description: Optional[str] = None


class UpdateProductRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    category: Optional[str] = Field(default=None, min_length=1)
    brand: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    unit: Optional[str] = None
    tags: Optional[list[str]] = None
    image_url: Optional[str] = None
    description: Optional[str] = None


class StockInRequest(BaseModel):
    quantity: int = Field(gt=0)
    note: Optional[str] = None


class StockOutRequest(BaseModel):
    quantity: int = Field(gt=0)
    note: Optional[str] = None


class AdjustStockRequest(BaseModel):
    quantity: int = Field(ge=0)
    note: Optional[str] = None


class UpdateMinStockRequest(BaseModel):
    minimum_stock: int = Field(ge=0)


class CreateInventoryRequest(BaseModel):
    product_id: str
    quantity: int = Field(ge=0, default=0)
    minimum_stock: int = Field(ge=0, default=5)
