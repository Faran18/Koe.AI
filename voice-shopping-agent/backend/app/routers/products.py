import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from app.core.database import get_session
from app.models.product import Product
from app.schemas.product import ProductRead, PaginatedProducts

router = APIRouter(prefix="/api/products", tags=["products"])


def _apply_filters(
    statement,
    category_slug: Optional[str] = None,
    gender: Optional[str] = None,
    color: Optional[str] = None,
    size: Optional[str] = None,
    fit: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    q: Optional[str] = None,
):
    """Shared filter logic for /products and /products/search so the two
    endpoints can never silently drift apart on what a given filter means."""
    from app.models.category import Category

    if category_slug:
        statement = statement.join(Category).where(Category.slug == category_slug)
    if gender:
        statement = statement.where(Product.gender == gender)
    if color:
        statement = statement.where(func.lower(Product.color) == color.lower())
    if size:
        statement = statement.where(func.lower(Product.size) == size.lower())
    if fit:
        statement = statement.where(func.lower(Product.fit) == fit.lower())
    if brand:
        statement = statement.where(func.lower(Product.brand) == brand.lower())
    if min_price is not None:
        statement = statement.where(Product.price >= min_price)
    if max_price is not None:
        statement = statement.where(Product.price <= max_price)
    if q:
        like = f"%{q.lower()}%"
        statement = statement.where(func.lower(Product.name).like(like))
    return statement


@router.get("", response_model=PaginatedProducts)
def list_products(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=100),
    category: Optional[str] = None,
    gender: Optional[str] = None,
    session: Session = Depends(get_session),
):
    statement = select(Product)
    statement = _apply_filters(statement, category_slug=category, gender=gender)

    total = session.exec(select(func.count()).select_from(statement.subquery())).one()
    items = session.exec(statement.offset((page - 1) * page_size).limit(page_size)).all()

    return PaginatedProducts(items=items, total=total, page=page, page_size=page_size)


@router.get("/search", response_model=PaginatedProducts)
def search_products(
    q: Optional[str] = None,
    category: Optional[str] = None,
    gender: Optional[str] = None,
    color: Optional[str] = None,
    size: Optional[str] = None,
    fit: Optional[str] = None,
    brand: Optional[str] = None,
    max_price: Optional[int] = None,
    min_price: Optional[int] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=100),
    session: Session = Depends(get_session),
):
    """This is the endpoint Phase 2's `search_products()` tool calls directly —
    keep its query params exactly matching that tool's JSON schema args."""
    statement = select(Product)
    statement = _apply_filters(
        statement, category_slug=category, gender=gender, color=color, size=size,
        fit=fit, brand=brand, min_price=min_price, max_price=max_price, q=q,
    )

    total = session.exec(select(func.count()).select_from(statement.subquery())).one()
    items = session.exec(statement.offset((page - 1) * page_size).limit(page_size)).all()

    return PaginatedProducts(items=items, total=total, page=page, page_size=page_size)


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: uuid.UUID, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
