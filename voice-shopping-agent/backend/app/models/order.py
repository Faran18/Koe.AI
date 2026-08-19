import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.product import Product

# Allowed values for Order.status — kept as a plain str column (matches this
# project's convention elsewhere, e.g. Product.gender/fit) rather than a DB
# enum, so adding a new status later doesn't need a migration.
ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"]


class Order(SQLModel, table=True):
    __tablename__ = "orders"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    status: str = Field(default="pending", index=True)
    subtotal: int = Field()  # snapshot total at checkout time — not recomputed later
    shipping_address: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    items: List["OrderItem"] = Relationship(back_populates="order")


class OrderItem(SQLModel, table=True):
    __tablename__ = "order_items"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    order_id: uuid.UUID = Field(foreign_key="orders.id", index=True)
    product_id: uuid.UUID = Field(foreign_key="products.id", index=True)
    quantity: int = Field(default=1)
    price_at_purchase: int = Field()  # snapshot of Product.price at checkout —
    # product prices can change later, order history shouldn't

    order: Optional["Order"] = Relationship(back_populates="items")
    product: Optional["Product"] = Relationship()

# NOTE: this table intentionally has no direct relationship declared back on
# Product (unlike CartItem, which Product does declare cart_items for) to
# avoid a circular back_populates chain — order history is read via OrderItem
# -> product, one direction, which is all the /api/orders endpoints need.
