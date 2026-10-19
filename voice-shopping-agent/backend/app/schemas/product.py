from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: str
    title: Optional[str]
    description: Optional[str]
    category_group: Optional[str]
    subcategory: Optional[str]
    rating: Optional[float]
    ratings_count: Optional[int]
    initial_price: Optional[float]
    discount: Optional[float]
    final_price: Optional[float]
    currency: Optional[str]
    sizes: Any
    product_details: Any
    product_specifications: Any
    github_images: Any
    price: float
    name: str
    image_url: str


class PaginatedProducts(BaseModel):
    items: list[ProductRead]
    total: int
    page: int
    page_size: int


class CategoryRead(BaseModel):
    id: str
    name: str
    slug: str


class FilterOptions(BaseModel):
    category_groups: list[str]
    subcategories: list[str]
    sizes: list[str]
    currencies: list[str]
    min_price: float
    max_price: float
