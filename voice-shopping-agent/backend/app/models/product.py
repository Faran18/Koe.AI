import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.cart import CartItem


class Product(SQLModel, table=True):
    __tablename__ = "products"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)
    category_id: uuid.UUID = Field(foreign_key="categories.id", index=True)
    subcategory: Optional[str] = Field(default=None, index=True)  # e.g. "t-shirt", "oxford", "chino"
    gender: str = Field(index=True)         # "men" | "women" | "unisex" — denormalized for fast filtering, mirrors category.gender
    brand: str = Field(index=True)
    price: int = Field(index=True)          # stored as smallest currency unit (PKR, no decimals needed) to avoid float rounding
    color: str = Field(index=True)
    size: str = Field(index=True)           # single-variant-per-row for Phase 1; see note below for Phase 3 variants
    fit: Optional[str] = Field(default=None, index=True)   # "slim" | "regular" | "relaxed" — null for shoes
    material: Optional[str] = Field(default=None)
    rating: float = Field(default=0.0)
    stock: int = Field(default=0)
    description: str = Field(default="")
    image_url: str = Field(default="")

    category: Optional["Category"] = Relationship(back_populates="products")
    cart_items: List["CartItem"] = Relationship(back_populates="product")

# NOTE on variants: Phase 1 keeps one row per (product, size, color) combo — simplest
# thing that lets filters and cart work. Phase 3 introduces `select_product_variant`,
# which is when it's worth splitting into `products` + `product_variants`. Don't
# build that split now — it's rework you don't need until the tool exists.
