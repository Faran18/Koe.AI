import uuid
from typing import List
from pydantic import BaseModel, Field
from app.schemas.product import ProductRead


class CartItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(default=1, ge=1, le=20)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1, le=20)


class CartItemRead(BaseModel):
    id: uuid.UUID
    product: ProductRead
    quantity: int
    line_total: int  # product.price * quantity — computed, not stored


class CartRead(BaseModel):
    id: uuid.UUID
    items: List[CartItemRead]
    subtotal: int
    item_count: int
