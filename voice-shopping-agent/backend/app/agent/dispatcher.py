# backend/app/agent/router.py
import httpx
from .tool_registry import TOOLS

BASE_URL = "http://localhost:8000"

async def execute_tool(tool_name: str, raw_args: dict) -> dict:
    if tool_name not in TOOLS:
        return {"error": f"unknown tool {tool_name}"}

    args = TOOLS[tool_name](**raw_args)  # validation
    params = args.model_dump(exclude_none=True)

    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        if tool_name == "search_products":
            r = await client.get("/api/products/search", params=params)
        elif tool_name == "get_filters":
            r = await client.get("/api/products", params=params)  # your get_filters route path
        elif tool_name == "get_product_details":
            r = await client.get(f"/api/products/{params['product_id']}")
        elif tool_name == "list_categories":
            r = await client.get("/api/categories")
        elif tool_name == "view_cart":
            r = await client.get("/api/cart")
        elif tool_name == "add_to_cart":
            r = await client.post("/api/cart", json=params)
        elif tool_name == "update_cart_item":
            r = await client.put(f"/api/cart/{params['item_id']}", json=params)
        elif tool_name == "remove_from_cart":
            r = await client.delete(f"/api/cart/{params['item_id']}")
        elif tool_name == "list_orders":
            r = await client.get("/api/orders")
        elif tool_name == "get_order":
            r = await client.get(f"/api/orders/{params['order_id']}")
        elif tool_name == "checkout":
            r = await client.post("/api/orders/checkout", json=params)
        elif tool_name == "update_order_status":
            r = await client.put(f"/api/orders/{params['order_id']}/status", json=params)
        elif tool_name == "cancel_order":
            r = await client.post(f"/api/orders/{params['order_id']}/cancel")

        r.raise_for_status()
        return r.json()
