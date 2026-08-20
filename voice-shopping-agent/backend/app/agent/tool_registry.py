# backend/app/agent/tool_registry.py
from .tools import SearchProducts, GetFilters

TOOLS = {
    "search_products": SearchProducts,
    "get_filters": GetFilters,
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