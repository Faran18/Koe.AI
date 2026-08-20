# backend/app/agent/tool_registry.py
from .tools import SearchProducts, GetFilters , GetProductDetails , ListCategories , ViewCart , AddToCart , UpdateCartItem , RemoveFromCart , ListOrders , GetOrder , Checkout , UpdateOrderStatus , CancelOrder

TOOLS = {
    "search_products": SearchProducts,
    "get_filters": GetFilters,
    "get_product_details": GetProductDetails,
    "list_categories": ListCategories,
    "view_cart": ViewCart,
    "add_to_cart": AddToCart,
    "update_cart_item": UpdateCartItem,
    "remove_from_cart": RemoveFromCart,
    "list_orders": ListOrders,
    "get_order": GetOrder,
    "checkout": Checkout,
    "update_order_status": UpdateOrderStatus,
    "cancel_order": CancelOrder,
}

def get_llm_tool_specs() -> list[dict]:
    """Flat {name, description, parameters} shape — for docs/logging/debugging.
    NOT sent directly to the LLM API."""
    specs = []
    for name, model in TOOLS.items():
        schema = model.model_json_schema()
        schema.pop("title", None)  # OpenAI/Groq don't want this field
        specs.append({
            "name": name,
            "description": (model.__doc__ or "").strip(),
            "parameters": schema,
        })
    return specs

def get_groq_tool_schemas() -> list[dict]:
    """Groq/OpenAI-compatible shape — this is what actually goes into tools= """
    return [
        {"type": "function", "function": spec}
        for spec in get_llm_tool_specs()
    ]
