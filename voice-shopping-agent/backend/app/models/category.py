import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.product import Product


class Category(SQLModel, table=True):
    __tablename__ = "categories"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)              # "Shirts", "Pants", "Shoes"
    slug: str = Field(index=True, unique=True)  # "shirts", "pants", "shoes"
    gender: str = Field(index=True)             # "men" | "women" | "unisex" — matches Phase 1's /men /women routes

    products: List["Product"] = Relationship(back_populates="category")
