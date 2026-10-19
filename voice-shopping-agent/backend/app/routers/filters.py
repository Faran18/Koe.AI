from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.product import Product, available_sizes
from app.schemas.product import FilterOptions

router = APIRouter(prefix="/api/filters", tags=["filters"])


@router.get("", response_model=FilterOptions)
def get_filters(
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    currency: Optional[str] = None,
    session: Session = Depends(get_session),
):
    conditions = [or_(Product.final_price.is_not(None), Product.initial_price.is_not(None))]
    if category:
        value = category.strip().lower()
        conditions.append(
            or_(
                func.lower(Product.category_group) == value,
                func.lower(Product.subcategory) == value,
            )
        )
    if subcategory:
        conditions.append(func.lower(Product.subcategory) == subcategory.strip().lower())
    category_groups = sorted(
        value for value in session.exec(
            select(Product.category_group).where(*conditions).distinct()
        ).all() if value
    )
    subcategories = sorted(
        value for value in session.exec(
            select(Product.subcategory).where(*conditions).distinct()
        ).all() if value
    )
    size_values = session.exec(select(Product.sizes).where(*conditions)).all()
    sizes = sorted({size for value in size_values for size in available_sizes(value)})
    currencies = sorted(
        value for value in session.exec(
            select(func.coalesce(Product.currency, "USD")).where(*conditions).distinct()
        ).all() if value
    )
    price_conditions = list(conditions)
    if currency:
        price_conditions.append(
            func.lower(func.coalesce(Product.currency, "USD")) == currency.strip().lower()
        )
    price_column = func.coalesce(Product.final_price, Product.initial_price)
    min_price, max_price = session.exec(
        select(func.min(price_column), func.max(price_column)).where(*price_conditions)
    ).one()

    return FilterOptions(
        category_groups=category_groups,
        subcategories=subcategories,
        sizes=sizes,
        currencies=currencies,
        min_price=min_price or 0.0,
        max_price=max_price or 0.0,
    )
