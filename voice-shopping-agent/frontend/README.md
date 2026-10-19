# VELORA frontend

The Next.js storefront reads the uploaded Supabase catalog through the FastAPI
backend. The browser never receives the database password or service-role key.
Supabase's public anon key is used only for Auth and the RLS-protected profile
table.

## Run locally

From the project root, configure `backend/.env` with the Supabase Postgres
connection string and start the services:

```bash
docker compose up --build
```

For frontend development outside Docker:

```bash
cd frontend
npm install
npm run dev
```

Copy `.env.example` to `.env.local`. `NEXT_PUBLIC_API_BASE` points to the
backend API; set `API_BASE_URL=http://backend:8000` for server-side requests
when running the frontend in Docker. The Supabase URL and anon key are
optional unless using Auth/profile features.

## Catalog and checkout

The backend maps the product fields uploaded by `dataset.py`, including the
string `product_id`, product and category descriptions, pricing/currency,
sizes, rating, specifications, and image URLs. Categories and filter options
are derived from Supabase instead of static product attributes.

The dataset has no inventory, gender, color, brand, or fit fields. The
storefront therefore does not filter or display fabricated values for them.
Cart and order data use the same Supabase Postgres database as the catalog.
Order totals snapshot catalog prices at checkout; no stock is decremented.

Wishlist remains browser-local. Profile preferences are stored in the
RLS-protected Supabase `profiles` table.

## Voice concierge

Text chat is forwarded to the backend `/api/chat` endpoint. Voice recordings
are sent to `/api/voice/transcribe`, which uses Groq's
`whisper-large-v3-turbo` model. Set `GROQ_API_KEY` in the backend environment
to enable chat and voice transcription.
