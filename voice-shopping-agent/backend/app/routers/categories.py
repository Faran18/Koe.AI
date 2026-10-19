import re
from typing import Optional

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.product import Product
from app.schemas.product import CategoryRead

router = APIRouter(prefix="/api/categories", tags=["categories"])


def _slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


@router.get("", response_model=list[CategoryRead])
def list_categories(
    category_group: Optional[str] = None,
    session: Session = Depends(get_session),
):
    statement = select(Product.category_group).where(Product.category_group.is_not(None)).distinct()
    if category_group:
        statement = statement.where(Product.category_group == category_group)

    names = sorted(name for name in session.exec(statement).all() if name)
    return [CategoryRead(id=_slug(name), name=name, slug=_slug(name)) for name in names]
