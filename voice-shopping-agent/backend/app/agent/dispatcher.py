# backend/app/agent/dispatcher.py
import httpx
from pydantic import ValidationError
from .retrieval import retrieve_store_info
from .tool_registry import TOOLS

BASE_URL = "http://localhost:8000"


def trim_product_list_for_llm(data: dict, max_items: int = 5) -> dict:
    """Trims search results to keep prompt tokens well below rate limits."""
    if not isinstance(data, dict):
        return data

    items = data.get("items", [])
    trimmed = [
        {
            "product_id": p.get("product_id"),
            "name": p.get("name") or p.get("title"),
            "price": p.get("price"),
            "currency": p.get("currency"),
            "category_group": p.get("category_group"),
            "subcategory": p.get("subcategory"),
            "sizes": p.get("sizes"),
            "rating": p.get("rating"),
        }
        for p in items[:max_items]
    ]
    return {
        "items": trimmed,
        "total_matches": data.get("total", len(trimmed)),
    }


def trim_cart_for_llm(cart_data: dict) -> dict:
    """Strips nested product descriptions and URLs to prevent context bloat."""
    if not isinstance(cart_data, dict):
        return cart_data

    items = cart_data.get("items", [])
    trimmed_items = [
        {
            "item_id": item.get("id"),
            "product_id": (item.get("product") or {}).get("product_id")
            or (item.get("product") or {}).get("id")
            or item.get("product_id"),
            "product_name": (item.get("product") or {}).get("name"),
            "size": item.get("size"),
            "quantity": item.get("quantity"),
            "line_total": item.get("line_total"),
        }
        for item in items
    ]
    return {
        "items": trimmed_items,
        "subtotal": cart_data.get("subtotal", 0),
        "item_count": cart_data.get("item_count", len(trimmed_items)),
    }


async def execute_tool(tool_name: str, raw_args: dict) -> dict:
    if tool_name not in TOOLS:
        return {"error": f"unknown tool {tool_name}"}

    try:
        args = TOOLS[tool_name](**raw_args)
    except ValidationError as e:
        return {"error": f"invalid arguments for {tool_name}: {e}"}

    params = args.model_dump(exclude_none=True)

    try:
        async with httpx.AsyncClient(base_url=BASE_URL) as client:
            if tool_name == "retrieve_store_info":
                chunks = retrieve_store_info(args.query, topic=args.topic)
                return {"relevant_info": chunks}

            elif tool_name == "search_products":
                r = await client.get("/api/products/search", params=params)
                r.raise_for_status()
                return trim_product_list_for_llm(r.json(), max_items=5)

            elif tool_name == "get_filters":
                r = await client.get("/api/filters", params=params)
                if r.status_code == 404:
                    r = await client.get(
                        "/api/products/filters", params=params
                    )
                r.raise_for_status()
                return r.json()

            elif tool_name == "get_product_details":
                r = await client.get(f"/api/products/{params['product_id']}")

            elif tool_name == "list_categories":
                r = await client.get("/api/categories")

            # --- Cart Endpoints ---
            elif tool_name == "view_cart":
                r = await client.get("/api/cart")
                r.raise_for_status()
                return trim_cart_for_llm(r.json())

            elif tool_name == "add_to_cart":
                r = await client.post("/api/cart/items", json=params)
                r.raise_for_status()
                return trim_cart_for_llm(r.json())

            elif tool_name == "update_cart_item":
                r = await client.patch(
                    f"/api/cart/items/{params['item_id']}", json=params
                )
                r.raise_for_status()
                return trim_cart_for_llm(r.json())

            elif tool_name == "remove_from_cart":
                r = await client.delete(f"/api/cart/items/{params['item_id']}")
                r.raise_for_status()
                return (
                    trim_cart_for_llm(r.json())
                    if r.text
                    else {"success": True}
                )

            # --- Order Endpoints ---
            elif tool_name == "list_orders":
                r = await client.get("/api/orders", params=params)

            elif tool_name == "get_order":
                r = await client.get(f"/api/orders/{params['order_id']}")

            elif tool_name == "checkout":
                r = await client.post("/api/orders", json=params)

            elif tool_name == "update_order_status":
                order_id = params.pop("order_id")
                r = await client.patch(f"/api/orders/{order_id}", json=params)

            elif tool_name == "cancel_order":
                r = await client.delete(f"/api/orders/{params['order_id']}")

            else:
                return {"error": f"no dispatch logic for {tool_name}"}

            r.raise_for_status()
            return r.json()

    except httpx.HTTPStatusError as e:
        return {"error": f"API call failed: {e.response.status_code}"}
    except httpx.RequestError as e:
        return {"error": f"could not reach backend API: {e}"}
