import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.product import ProductRead


class OrderCreate(BaseModel):
    """Body for POST /api/orders — checkout. No product/quantity fields here:
    the order is always built from whatever is currently in the guest cart,
    same as the guide's Phase 9 flow. Only checkout-specific info goes here."""
    shipping_address: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: str  # validated against ORDER_STATUSES in the router, not here —
    # keeps the allowed-list in one place (models/order.py) instead of two


class OrderItemRead(BaseModel):
    id: uuid.UUID
    product: ProductRead
    quantity: int
    price_at_purchase: int
    line_total: int  # price_at_purchase * quantity — computed, not stored

    class Config:
        from_attributes = True


class OrderRead(BaseModel):
    id: uuid.UUID
    status: str
    subtotal: int
    shipping_address: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemRead]
    item_count: int

    class Config:
        from_attributes = True


class PaginatedOrders(BaseModel):
    items: List[OrderRead]
    total: int
    page: int
    page_size: int
