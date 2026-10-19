import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import String, cast, func, or_
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.product import Product
from app.schemas.product import PaginatedProducts, ProductRead

router = APIRouter(prefix="/api/products", tags=["products"])


def _price_column():
    return func.coalesce(Product.final_price, Product.initial_price, 0.0)


def _apply_filters(
    statement,
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    size: Optional[str] = None,
    currency: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    q: Optional[str] = None,
):
    statement = statement.where(
        or_(Product.final_price.is_not(None), Product.initial_price.is_not(None))
    )
    if category:
        value = category.strip().lower()
        statement = statement.where(
            or_(
                func.lower(Product.category_group) == value,
                func.lower(Product.subcategory) == value,
            )
        )
    if subcategory:
        statement = statement.where(func.lower(Product.subcategory) == subcategory.strip().lower())
    if size:
        size_values = [cast(Product.sizes, JSONB).contains([size])]
        size_values.append(cast(Product.sizes, JSONB).contains([{"size": size}]))
        try:
            numeric_size = float(size)
        except ValueError:
            pass
        else:
            if math.isfinite(numeric_size):
                size_values.append(cast(Product.sizes, JSONB).contains([numeric_size]))
        statement = statement.where(or_(*size_values))
    if currency:
        statement = statement.where(func.lower(func.coalesce(Product.currency, "USD")) == currency.lower())
    if min_price is not None:
        statement = statement.where(_price_column() >= min_price)
    if max_price is not None:
        statement = statement.where(_price_column() <= max_price)
    if min_rating is not None:
        statement = statement.where(Product.rating >= min_rating)
    if q:
        like = f"%{q.strip().lower()}%"
        statement = statement.where(
            or_(
                func.lower(func.coalesce(Product.title, "")).like(like),
                func.lower(func.coalesce(Product.description, "")).like(like),
                func.lower(func.coalesce(Product.category_group, "")).like(like),
                func.lower(func.coalesce(Product.subcategory, "")).like(like),
                func.lower(cast(Product.sizes, String)).like(like),
                func.lower(cast(Product.product_details, String)).like(like),
                func.lower(cast(Product.product_specifications, String)).like(like),
            )
        )
    return statement


@router.get("", response_model=PaginatedProducts)
def list_products(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=100),
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    session: Session = Depends(get_session),
):
    statement = _apply_filters(select(Product), category=category, subcategory=subcategory)
    total = session.exec(select(func.count()).select_from(statement.subquery())).one()
    items = session.exec(
        statement.order_by(Product.product_id).offset((page - 1) * page_size).limit(page_size)
    ).all()
    return PaginatedProducts(items=items, total=total, page=page, page_size=page_size)


@router.get("/search", response_model=PaginatedProducts)
def search_products(
    q: Optional[str] = None,
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    size: Optional[str] = None,
    currency: Optional[str] = None,
    max_price: Optional[float] = None,
    min_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=100),
    session: Session = Depends(get_session),
):
    statement = _apply_filters(
        select(Product),
        category=category,
        subcategory=subcategory,
        size=size,
        currency=currency,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        q=q,
    )
    total = session.exec(select(func.count()).select_from(statement.subquery())).one()
    items = session.exec(
        statement.order_by(Product.product_id).offset((page - 1) * page_size).limit(page_size)
    ).all()
    return PaginatedProducts(items=items, total=total, page=page, page_size=page_size)


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: str, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product or (product.final_price is None and product.initial_price is None):
        raise HTTPException(status_code=404, detail="Product not found")
    return product
