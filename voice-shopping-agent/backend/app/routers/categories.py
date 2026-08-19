from typing import Optional
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.category import Category
from app.schemas.product import CategoryRead

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead])
def list_categories(gender: Optional[str] = None, session: Session = Depends(get_session)):
    statement = select(Category)
    if gender:
        statement = statement.where(Category.gender == gender)
    return session.exec(statement).all()
