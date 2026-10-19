import uuid
from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class Cart(SQLModel, table=True):
    __tablename__ = "cart"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True, unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    items: List["CartItem"] = Relationship(back_populates="cart")


class CartItem(SQLModel, table=True):
    __tablename__ = "cart_items"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    cart_id: uuid.UUID = Field(foreign_key="cart.id", index=True)
    product_id: str = Field(foreign_key="products.product_id", index=True)
    size: Optional[str] = Field(default=None)
    quantity: int = Field(default=1)
    added_at: datetime = Field(default_factory=datetime.utcnow)

    cart: Optional["Cart"] = Relationship(back_populates="items")
