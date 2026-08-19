from typing import Optional
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from app.core.database import get_session
from app.models.product import Product
from app.models.category import Category
from app.schemas.product import FilterOptions

router = APIRouter(prefix="/api/filters", tags=["filters"])


@router.get("", response_model=FilterOptions)
def get_filters(
    category: Optional[str] = None,
    gender: Optional[str] = None,
    session: Session = Depends(get_session),
):
    """Distinct filter values scoped to the current category/gender — this is
    what makes the sidebar only ever show options that return real results,
    instead of a static hardcoded filter list."""
    base = select(Product)
    if category:
        base = base.join(Category).where(Category.slug == category)
    if gender:
        base = base.where(Product.gender == gender)

    colors = session.exec(base.with_only_columns(Product.color).distinct()).all()
    sizes = session.exec(base.with_only_columns(Product.size).distinct()).all()
    fits = session.exec(base.with_only_columns(Product.fit).distinct()).all()
    brands = session.exec(base.with_only_columns(Product.brand).distinct()).all()

    prices = session.exec(base.with_only_columns(Product.price)).all()
    min_price = min(prices) if prices else 0
    max_price = max(prices) if prices else 0

    return FilterOptions(
        colors=sorted([c for c in colors if c]),
        sizes=sorted([s for s in sizes if s]),
        fits=sorted([f for f in fits if f]),
        brands=sorted([b for b in brands if b]),
        min_price=min_price,
        max_price=max_price,
    )
