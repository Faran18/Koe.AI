import uuid
from typing import List
from pydantic import BaseModel, Field
from app.schemas.product import ProductRead


class CartItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1, le=20)
    size: str | None = None


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1, le=20)


class CartItemRead(BaseModel):
    id: uuid.UUID
    product: ProductRead
    quantity: int
    size: str | None = None
    line_total: float


class CartRead(BaseModel):
    id: uuid.UUID
    items: List[CartItemRead]
    subtotal: float
    item_count: int
