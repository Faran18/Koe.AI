# backend/app/agent/tools.py
from pydantic import BaseModel, Field
from typing import Optional

class SearchProducts(BaseModel):
    """Search products by keyword, category, gender, and filters. Use this
    whenever the customer describes what they're looking for."""
    q: Optional[str] = Field(None, description="Free-text search keyword")
    category: Optional[str] = Field(None, description="Category slug, e.g. 'shirts'")
    gender: Optional[str] = Field(None, description="'men' or 'women'")
    color: Optional[str] = None
    size: Optional[str] = None
    fit: Optional[str] = None
    brand: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    page: int = Field(1, description="Page number, default 1")
    page_size: int = Field(24, description="Results per page, default 24")

class GetFilters(BaseModel):
    """Get the available filter options (colors, sizes, fits, brands, price
    range) scoped to a category/gender. Use this if you need to know what
    filter values actually exist before applying one, e.g. to check whether
    'navy' is a valid color before searching for it."""
    category: Optional[str] = None
    gender: Optional[str] = None


# --- products ---------------------------------------------------------

class GetProductDetails(BaseModel):
    """Get full details for a single product by its ID. Use this when the
    customer asks for more info about one specific item they've already
    seen in a search result — never invent a product_id from memory, always
    copy it from a previous search_products or cart/order tool result."""
    product_id: str = Field(..., description="UUID of the product, copied from a prior tool result")


# --- categories ---------------------------------------------------------

class ListCategories(BaseModel):
    """List available store categories, optionally scoped to a gender. Use
    this if the customer asks what's available to browse, e.g. 'what
    categories do you have for men?'"""
    gender: Optional[str] = Field(None, description="'men' or 'women'")


# --- cart ---------------------------------------------------------

class ViewCart(BaseModel):
    """View the current contents of the customer's cart, including line
    items, subtotal, and item count. Takes no arguments — there is only one
    active cart per session."""
    pass


class AddToCart(BaseModel):
    """Add a product to the cart, or increase its quantity if it's already
    in the cart. Use this only after the customer has confirmed which exact
    product they want — don't guess a product_id, copy it from a prior
    search_products or get_product_details result."""
    product_id: str = Field(..., description="UUID of the product to add, copied from a prior tool result")
    quantity: int = Field(1, description="How many to add, default 1")


class UpdateCartItem(BaseModel):
    """Change the quantity of an item already in the cart. Use this when the
    customer wants more or fewer of something they've already added — not
    for adding a brand-new product (use add_to_cart for that)."""
    item_id: str = Field(..., description="UUID of the cart item (not the product), copied from a prior view_cart or add_to_cart result")
    quantity: int = Field(..., description="New total quantity for this line item")


class RemoveFromCart(BaseModel):
    """Remove one item entirely from the cart. Use this when the customer
    wants to take something out of the cart completely."""
    item_id: str = Field(..., description="UUID of the cart item (not the product), copied from a prior view_cart result")


# --- orders ---------------------------------------------------------

class ListOrders(BaseModel):
    """List the customer's past orders, optionally filtered by status. Use
    this for questions like 'what did I order last time' or 'is my order
    still pending'."""
    page: int = Field(1, description="Page number, default 1")
    page_size: int = Field(20, description="Results per page, default 20")
    status: Optional[str] = Field(
        None,
        description="Filter by order status. One of: pending, confirmed, shipped, delivered, cancelled",
    )


class GetOrder(BaseModel):
    """Get full details for a single order by its ID, including its line
    items and current status. Use this when the customer asks about one
    specific order they've already referenced."""
    order_id: str = Field(..., description="UUID of the order, copied from a prior tool result")


class Checkout(BaseModel):
    """Convert the customer's current cart into an order — this is the
    checkout step. Only call this after the customer has explicitly
    confirmed they want to place the order; never call it just because a
    cart has items in it. Operates on whatever is currently in the cart —
    it does not take product or quantity arguments."""
    shipping_address: Optional[str] = Field(None, description="Delivery address for this order, if the customer has provided one")


class UpdateOrderStatus(BaseModel):
    """Change the status of an existing order, e.g. moving it from pending
    to confirmed. Use this for order-management actions, not for cancelling
    an order — use cancel_order for that instead."""
    order_id: str = Field(..., description="UUID of the order, copied from a prior tool result")
    status: str = Field(..., description="New status. One of: pending, confirmed, shipped, delivered, cancelled")


class CancelOrder(BaseModel):
    """Cancel an existing order and restock its items. Only works while the
    order is still 'pending' or 'confirmed' — use this when the customer
    explicitly asks to cancel, never as a default action."""
    order_id: str = Field(..., description="UUID of the order, copied from a prior tool result")