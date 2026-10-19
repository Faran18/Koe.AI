from typing import Any, Optional

from sqlalchemy import JSON
from sqlmodel import Field, SQLModel


def available_sizes(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    sizes = []
    for item in value:
        if isinstance(item, (str, int, float)):
            size = str(item).strip()
        elif isinstance(item, dict) and item.get("size") is not None:
            size = str(item["size"]).strip()
        else:
            size = ""
        if size and size not in sizes:
            sizes.append(size)
    return sizes


class Product(SQLModel, table=True):
    __tablename__ = "products"

    product_id: str = Field(primary_key=True)
    title: Optional[str] = Field(default=None, index=True)
    description: Optional[str] = Field(default=None)
    category_group: Optional[str] = Field(default=None, index=True)
    subcategory: Optional[str] = Field(default=None, index=True)
    rating: Optional[float] = Field(default=None)
    ratings_count: Optional[int] = Field(default=None)
    initial_price: Optional[float] = Field(default=None)
    discount: Optional[float] = Field(default=None)
    final_price: Optional[float] = Field(default=None, index=True)
    currency: Optional[str] = Field(default="USD")
    sizes: Any = Field(default=None, sa_type=JSON)
    product_details: Any = Field(default=None, sa_type=JSON)
    product_specifications: Any = Field(default=None, sa_type=JSON)
    github_images: Any = Field(default=None, sa_type=JSON)

    @property
    def price(self) -> float:
        value = self.final_price if self.final_price is not None else self.initial_price
        return float(value) if value is not None else 0.0

    @property
    def name(self) -> str:
        return self.title or f"Product {self.product_id}"

    @property
    def image_url(self) -> str:
        images = self.github_images
        if isinstance(images, list):
            return next((image for image in images if isinstance(image, str) and image), "")
        if isinstance(images, str):
            return images
        return ""
