import uuid
from typing import Optional, List
from pydantic import BaseModel


class ProductRead(BaseModel):
    id: uuid.UUID
    name: str
    category_id: uuid.UUID
    subcategory: Optional[str]
    gender: str
    brand: str
    price: int
    color: str
    size: str
    fit: Optional[str]
    material: Optional[str]
    rating: float
    stock: int
    description: str
    image_url: str

    class Config:
        from_attributes = True


class PaginatedProducts(BaseModel):
    items: List[ProductRead]
    total: int
    page: int
    page_size: int


class CategoryRead(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    gender: str

    class Config:
        from_attributes = True


class FilterOptions(BaseModel):
    colors: List[str]
    sizes: List[str]
    fits: List[str]
    brands: List[str]
    min_price: int
    max_price: int
