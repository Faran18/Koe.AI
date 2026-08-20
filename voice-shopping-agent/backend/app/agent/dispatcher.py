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

        r.raise_for_status()
        return r.json()