"""
Run inside the backend container (or locally with DATABASE_URL pointed at the
Postgres from docker-compose):

    docker compose exec backend python seed.py

Idempotent-ish: it wipes and re-seeds products/categories/cart every run, so
it's safe to re-run whenever you want a fresh dataset. It does NOT touch the
`users` table's guest row past the first run.
"""
import random
import uuid
from faker import Faker
from sqlmodel import Session, delete
from app.core.database import engine, init_db
from app.core.config import settings
from app.models.category import Category
from app.models.product import Product
from app.models.user import User
from app.models.cart import Cart, CartItem

fake = Faker()
random.seed(42)  # reproducible dataset across re-seeds — makes eval scenarios stable

CATEGORY_DEFS = [
    ("Shirts", "shirts", "men"),
    ("Pants", "pants", "men"),
    ("Shoes", "shoes", "men"),
    ("Shirts", "shirts-women", "women"),   # separate slug: men's/women's shirts are different rows
    ("Pants", "pants-women", "women"),
    ("Shoes", "shoes-women", "women"),
]

COLORS = ["black", "white", "navy", "grey", "beige", "olive", "burgundy", "brown"]
BRANDS = ["Northline", "Fielder & Co", "Arkhive", "Basewear", "Studio 12", "Meridian"]
FITS = ["slim", "regular", "relaxed"]
SIZES_APPAREL = ["XS", "S", "M", "L", "XL", "XXL"]
SIZES_SHOES = ["6", "7", "8", "9", "10", "11", "12"]
MATERIALS = ["cotton", "linen", "polyester blend", "denim", "leather", "canvas", "wool blend"]

SUBCATEGORY_BY_SLUG = {
    "shirts": ["t-shirt", "oxford", "polo", "flannel"],
    "shirts-women": ["blouse", "t-shirt", "tunic"],
    "pants": ["chino", "denim", "cargo", "trouser"],
    "pants-women": ["chino", "denim", "trouser", "wide-leg"],
    "shoes": ["sneaker", "loafer", "boot", "sandal"],
    "shoes-women": ["sneaker", "flat", "boot", "heel"],
}

PRODUCTS_PER_CATEGORY = 50  # 6 categories x 50 = 300 products


def run():
    init_db()
    with Session(engine) as session:
        # wipe in FK-safe order
        session.exec(delete(CartItem))
        session.exec(delete(Cart))
        session.exec(delete(Product))
        session.exec(delete(Category))
        session.commit()

        categories = {}
        for name, slug, gender in CATEGORY_DEFS:
            cat = Category(name=name, slug=slug, gender=gender)
            session.add(cat)
            session.flush()
            categories[slug] = cat
        session.commit()

        for slug, cat in categories.items():
            is_shoes = "shoes" in slug
            sizes = SIZES_SHOES if is_shoes else SIZES_APPAREL
            subcats = SUBCATEGORY_BY_SLUG[slug]

            for _ in range(PRODUCTS_PER_CATEGORY):
                subcat = random.choice(subcats)
                product = Product(
                    name=f"{fake.word().capitalize()} {subcat.title()}",
                    category_id=cat.id,
                    subcategory=subcat,
                    gender=cat.gender,
                    brand=random.choice(BRANDS),
                    price=random.randrange(1200, 12000, 100),  # PKR, matches "under 5000" style queries from the spec
                    color=random.choice(COLORS),
                    size=random.choice(sizes),
                    fit=None if is_shoes else random.choice(FITS),
                    material=random.choice(MATERIALS),
                    rating=round(random.uniform(3.0, 5.0), 1),
                    stock=random.randint(0, 40),
                    description=fake.sentence(nb_words=12),
                    image_url=f"https://picsum.photos/seed/{uuid.uuid4()}/600/800",
                )
                session.add(product)
        session.commit()

        # seed the single guest user Phase 1's cart endpoints resolve to
        guest_id = uuid.UUID(settings.guest_user_id)
        if not session.get(User, guest_id):
            session.add(User(id=guest_id, is_guest=True))
            session.commit()

        print(f"Seeded {len(categories)} categories and {PRODUCTS_PER_CATEGORY * len(categories)} products.")


if __name__ == "__main__":
    run()
