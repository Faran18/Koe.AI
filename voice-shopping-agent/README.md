# Voice Shopping Agent — Phase 1

Plain e-commerce backend, no AI. This is the "controlled environment" the
agent acts on in later phases.

## What's in this slice

- **DB schema** (SQLModel → Postgres): `categories`, `products`, `users`, `cart`, `cart_items`
- **REST API** (FastAPI): products list/search/detail, categories, filters, full cart CRUD
- Alembic wired up (no migrations generated yet — see below)
- Seed script: 6 categories × 50 products = 300 seeded products via Faker

Frontend pages come in the next pass — this slice is API + DB only.

## Run it

```bash
docker compose up --build
```

This starts Postgres (5432) and Redis (6379, unused until Phase 4), and the
backend (8000) with tables auto-created on startup via `init_db()`.

Seed the database:

```bash
docker compose exec backend python seed.py
```

Check it worked:

```bash
curl http://localhost:8000/api/categories
curl "http://localhost:8000/api/products/search?category=shirts&color=black&max_price=5000"
curl http://localhost:8000/api/cart
```

Interactive API docs: http://localhost:8000/docs

## Generating a real Alembic migration

`init_db()` (`SQLModel.metadata.create_all`) is what actually creates your
tables right now — it's a dev-only shortcut. Once you want migration history
instead of that shortcut, generate the first real migration against the
running Postgres:

```bash
docker compose exec backend alembic revision --autogenerate -m "init schema"
docker compose exec backend alembic upgrade head
```

Then stop calling `init_db()` on startup (`app/main.py`) so Alembic stays the
single source of truth for schema changes — see the note in
`app/core/database.py`.

## Schema notes worth keeping in your vault

- `products` stores one row per (product, size, color) — no separate variants
  table yet. That split is deliberately deferred to Phase 3, when
  `select_product_variant` actually needs it. See the comment in
  `app/models/product.py`.
- `price` is an integer (PKR, no decimal subunit in common use) — avoids float
  rounding in cart totals.
- Cart resolves to a single seeded guest user (`settings.guest_user_id`) —
  this is the seam Phase 4's `session_id` strategy replaces. See
  `app/routers/cart.py`.
- `GET /api/products/search` query params are written to match what
  Phase 2's `search_products()` tool will call with directly — keep them in
  sync when you build that tool contract.

## Endpoint summary

| Method | Path | Notes |
|---|---|---|
| GET | `/api/products` | paginated list, `category`/`gender` filters |
| GET | `/api/products/search` | full filter set: `q, category, gender, color, size, fit, brand, min_price, max_price` |
| GET | `/api/products/{id}` | 404 if not found |
| GET | `/api/categories` | optional `?gender=` |
| GET | `/api/filters` | distinct colors/sizes/fits/brands + price range, scoped to `?category=&gender=` |
| GET | `/api/cart` | guest cart |
| POST | `/api/cart/items` | body: `{product_id, quantity}` — validates stock |
| PATCH | `/api/cart/items/{id}` | body: `{quantity}` — validates stock, ownership |
| DELETE | `/api/cart/items/{id}` | validates ownership |
