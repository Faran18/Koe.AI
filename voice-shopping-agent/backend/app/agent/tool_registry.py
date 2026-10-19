# backend/app/agent/tool_registry.py
import copy
from .tools import (
    AddToCart,
    CancelOrder,
    Checkout,
    GetFilters,
    GetOrder,
    GetProductDetails,
    ListCategories,
    ListOrders,
    RemoveFromCart,
    RetrieveStoreInfo,
    SearchProducts,
    UpdateCartItem,
    UpdateOrderStatus,
    ViewCart,
)

TOOLS = {
    "retrieve_store_info": RetrieveStoreInfo,
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


def sanitize_schema(schema_dict: dict) -> dict:
    """Strips title and redundant parameter-level description keys for LLM tokenizers."""
    schema = copy.deepcopy(schema_dict)

    # 1. Remove top-level schema metadata
    schema.pop("title", None)
    schema.pop("description", None)

    # 2. Strip titles and clean inner property definitions
    if "properties" in schema and isinstance(schema["properties"], dict):
        for prop in schema["properties"].values():
            if isinstance(prop, dict):
                prop.pop("title", None)
                if "anyOf" in prop:
                    for branch in prop["anyOf"]:
                        if isinstance(branch, dict):
                            branch.pop("title", None)

    # 3. Ensure structure is valid
    if "type" not in schema:
        schema["type"] = "object"
    if "properties" not in schema:
        schema["properties"] = {}

    return schema


def get_llm_tool_specs() -> list[dict]:
    specs = []
    for name, model in TOOLS.items():
        raw_schema = model.model_json_schema()
        clean_params = sanitize_schema(raw_schema)

        # Ensure description is a clean single line or short text
        doc = (model.__doc__ or "").strip()
        description = doc if doc else f"Execute {name.replace('_', ' ')} action"

        specs.append(
            {
                "name": name,
                "description": description,
                "parameters": clean_params,
            }
        )
    return specs


def get_groq_tool_schemas() -> list[dict]:
    return [
        {"type": "function", "function": spec} for spec in get_llm_tool_specs()
    ]
