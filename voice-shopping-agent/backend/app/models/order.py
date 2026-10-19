import uuid
from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

# Allowed values for Order.status — kept as a plain str column so adding a
# status later does not require a database enum migration.
ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"]


class Order(SQLModel, table=True):
    __tablename__ = "orders"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    status: str = Field(default="pending", index=True)
    subtotal: float = Field()  # snapshot total at checkout time — not recomputed later
    shipping_address: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    items: List["OrderItem"] = Relationship(back_populates="order")


class OrderItem(SQLModel, table=True):
    __tablename__ = "order_items"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    order_id: uuid.UUID = Field(foreign_key="orders.id", index=True)
    product_id: str = Field(foreign_key="products.product_id", index=True)
    size: Optional[str] = Field(default=None)
    quantity: int = Field(default=1)
    price_at_purchase: float = Field()  # snapshot of Product.price at checkout —
    # product prices can change later, order history shouldn't

    order: Optional["Order"] = Relationship(back_populates="items")
