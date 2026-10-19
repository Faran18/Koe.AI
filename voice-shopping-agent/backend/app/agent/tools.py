# backend/app/agent/tools.py
from pydantic import BaseModel, Field
from typing import Optional

class SearchProducts(BaseModel):
    """Search products by keyword, category, size, price, and rating. Use this
    whenever the customer describes what they're looking for."""
    q: Optional[str] = Field(None, description="Free-text search keyword")
    category: Optional[str] = Field(None, description="Category group or subcategory from the catalog")
    subcategory: Optional[str] = None
    size: Optional[str] = None
    currency: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    page: int = Field(1, description="Page number, default 1")
    page_size: int = Field(24, description="Results per page, default 24")

class GetFilters(BaseModel):
    """Get the available filter options (categories, subcategories, sizes, price
    range) scoped to a category/subcategory. Use this if you need to know what
    filter values actually exist before applying one."""
    category: Optional[str] = None
    subcategory: Optional[str] = None
    currency: Optional[str] = None


# --- products ---------------------------------------------------------

class GetProductDetails(BaseModel):
    """Get full details for a single product by its ID. Use this when the
    customer asks for more info about one specific item they've already
    seen in a search result — never invent a product_id from memory, always
    copy it from a previous search_products or cart/order tool result."""
    product_id: str = Field(..., description="Dataset product_id copied from a prior tool result")


# --- categories ---------------------------------------------------------

class ListCategories(BaseModel):
    """List available catalog categories when the customer asks what's available."""


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
    product_id: str = Field(..., description="Dataset product_id copied from a prior tool result")
    quantity: int = Field(1, description="How many to add, default 1")
    size: Optional[str] = Field(None, description="One of the product's listed sizes, when applicable")


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
    """Cancel an existing order. Only works while the
    order is still 'pending' or 'confirmed' — use this when the customer
    explicitly asks to cancel, never as a default action."""
    order_id: str = Field(..., description="UUID of the order, copied from a prior tool result")


# --- retrieval-info ---------------------------------------------------------
class RetrieveStoreInfo(BaseModel):
    """Look up store policies, FAQs, shipping, returns, exchanges, or payment
    info. Use this for any question about store policy — NOT for product
    search."""
    query: str = Field(..., description="The customer's question, in their own words")
    topic: Optional[str] = Field(
        None,
        description="One of: 'returns', 'shipping', 'exchange', 'payment' — "
                    "pick the closest match based on the question, or omit if unsure"
    )
