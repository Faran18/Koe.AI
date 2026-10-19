"""Check the uploaded Supabase catalog and initialize the guest cart user.

This script intentionally never inserts, updates, or deletes catalog rows.
"""
import uuid

from sqlmodel import Session, func, select

from app.core.config import settings
from app.core.database import engine, init_db
from app.models.product import Product
from app.models.user import User


def run() -> None:
    init_db()
    with Session(engine) as session:
        product_count = session.exec(select(func.count()).select_from(Product)).one()
        if product_count == 0:
            raise RuntimeError("Supabase products table is empty; upload the dataset before continuing.")

        guest_id = uuid.UUID(settings.guest_user_id)
        if not session.get(User, guest_id):
            session.add(User(id=guest_id, is_guest=True))
            session.commit()

        print(f"Connected to the Supabase catalog: {product_count} products.")


if __name__ == "__main__":
    run()
