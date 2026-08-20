# backend/app/agent/tools.py
from pydantic import BaseModel, Field
from typing import Optional

class SearchProducts(BaseModel):
    """Search products by keyword, category, gender, and filters. Use this
    whenever the customer describes what they're looking for."""
    q: Optional[str] = Field(None, description="Free-text search keyword")
    category: Optional[str] = Field(None, description="Category slug, e.g. 'shirts'")
    gender: Optional[str] = Field(None, description="'men' or 'women'")
    color: Optional[str] = None
    size: Optional[str] = None
    fit: Optional[str] = None
    brand: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    page: int = Field(1, description="Page number, default 1")
    page_size: int = Field(24, description="Results per page, default 24")

class GetFilters(BaseModel):
    """Get the available filter options (colors, sizes, fits, brands, price
    range) scoped to a category/gender. Use this if you need to know what
    filter values actually exist before applying one, e.g. to check whether
    'navy' is a valid color before searching for it."""
    category: Optional[str] = None
    gender: Optional[str] = None