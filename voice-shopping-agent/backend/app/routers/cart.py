import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.config import settings
from app.core.database import get_session
from app.models.cart import Cart, CartItem
from app.models.product import Product, available_sizes
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemRead, CartItemUpdate, CartRead

router = APIRouter(prefix="/api/cart", tags=["cart"])


def _get_or_create_guest_cart(session: Session) -> Cart:
    guest_id = uuid.UUID(settings.guest_user_id)
    if not session.get(User, guest_id):
        session.add(User(id=guest_id, is_guest=True))
        session.flush()

    cart = session.exec(select(Cart).where(Cart.user_id == guest_id)).first()
    if not cart:
        cart = Cart(user_id=guest_id)
        session.add(cart)
        session.commit()
        session.refresh(cart)
    return cart


def _serialize_cart(session: Session, cart: Cart) -> CartRead:
    items = session.exec(select(CartItem).where(CartItem.cart_id == cart.id)).all()
    item_reads = []
    subtotal = 0.0
    currencies = set()
    for item in items:
        product = session.get(Product, item.product_id)
        if not product:
            raise HTTPException(status_code=409, detail="A cart product is no longer available")
        if product.final_price is None and product.initial_price is None:
            raise HTTPException(status_code=409, detail="A cart product has no price")
        currencies.add(product.currency or "USD")
        line_total = product.price * item.quantity
        subtotal += line_total
        item_reads.append(
            CartItemRead(
                id=item.id,
                product=product,
                quantity=item.quantity,
                size=item.size,
                line_total=line_total,
            )
        )
    if len(currencies) > 1:
        raise HTTPException(status_code=409, detail="A cart cannot total products in different currencies")
    return CartRead(
        id=cart.id,
        items=item_reads,
        subtotal=subtotal,
        item_count=sum(item.quantity for item in items),
    )


@router.get("", response_model=CartRead)
def view_cart(session: Session = Depends(get_session)):
    return _serialize_cart(session, _get_or_create_guest_cart(session))


@router.post("/items", response_model=CartRead, status_code=201)
def add_item(payload: CartItemCreate, session: Session = Depends(get_session)):
    cart = _get_or_create_guest_cart(session)
    product = session.get(Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.final_price is None and product.initial_price is None:
        raise HTTPException(status_code=409, detail="Product has no price and cannot be added to the cart")

    sizes = available_sizes(product.sizes)
    selected_size = payload.size or (sizes[0] if sizes else None)
    if selected_size and sizes and selected_size not in sizes:
        raise HTTPException(status_code=422, detail="Selected size is not available for this product")

    existing = session.exec(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == payload.product_id,
            CartItem.size == selected_size,
        )
    ).first()
    current_items = session.exec(select(CartItem).where(CartItem.cart_id == cart.id)).all()
    for item in current_items:
        current_product = session.get(Product, item.product_id)
        if current_product and (current_product.currency or "USD") != (product.currency or "USD"):
            raise HTTPException(status_code=409, detail="A cart cannot contain products in different currencies")
    if existing:
        if existing.quantity + payload.quantity > 20:
            raise HTTPException(status_code=422, detail="Cart quantity cannot exceed 20 for one size")
        existing.quantity += payload.quantity
        session.add(existing)
    else:
        session.add(
            CartItem(
                cart_id=cart.id,
                product_id=payload.product_id,
                size=selected_size,
                quantity=payload.quantity,
            )
        )

    session.commit()
    return _serialize_cart(session, cart)


@router.patch("/items/{item_id}", response_model=CartRead)
def update_item(
    item_id: uuid.UUID,
    payload: CartItemUpdate,
    session: Session = Depends(get_session),
):
    cart = _get_or_create_guest_cart(session)
    item = session.get(CartItem, item_id)
    if not item or item.cart_id != cart.id:
        raise HTTPException(status_code=404, detail="Cart item not found")

    item.quantity = payload.quantity
    session.add(item)
    session.commit()
    return _serialize_cart(session, cart)


@router.delete("/items/{item_id}", response_model=CartRead)
def remove_item(item_id: uuid.UUID, session: Session = Depends(get_session)):
    cart = _get_or_create_guest_cart(session)
    item = session.get(CartItem, item_id)
    if not item or item.cart_id != cart.id:
        raise HTTPException(status_code=404, detail="Cart item not found")

    session.delete(item)
    session.commit()
    return _serialize_cart(session, cart)
