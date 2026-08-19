import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.config import settings
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartRead, CartItemRead

router = APIRouter(prefix="/api/cart", tags=["cart"])


def _get_or_create_guest_cart(session: Session) -> Cart:
    """Phase 1 has no real auth, so every request resolves to the single guest
    user's cart. This is the seam Phase 4 replaces with session_id-scoped carts —
    keep it isolated here so that swap doesn't ripple through every endpoint."""
    guest_id = uuid.UUID(settings.guest_user_id)
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
    subtotal = 0
    for item in items:
        product = session.get(Product, item.product_id)
        line_total = product.price * item.quantity
        subtotal += line_total
        item_reads.append(CartItemRead(id=item.id, product=product, quantity=item.quantity, line_total=line_total))
    return CartRead(id=cart.id, items=item_reads, subtotal=subtotal, item_count=sum(i.quantity for i in items))


@router.get("", response_model=CartRead)
def view_cart(session: Session = Depends(get_session)):
    cart = _get_or_create_guest_cart(session)
    return _serialize_cart(session, cart)


@router.post("/items", response_model=CartRead, status_code=201)
def add_item(payload: CartItemCreate, session: Session = Depends(get_session)):
    cart = _get_or_create_guest_cart(session)

    product = session.get(Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < payload.quantity:
        raise HTTPException(status_code=409, detail=f"Only {product.stock} in stock")

    existing = session.exec(
        select(CartItem).where(CartItem.cart_id == cart.id, CartItem.product_id == payload.product_id)
    ).first()

    if existing:
        new_qty = existing.quantity + payload.quantity
        if product.stock < new_qty:
            raise HTTPException(status_code=409, detail=f"Only {product.stock} in stock")
        existing.quantity = new_qty
        session.add(existing)
    else:
        session.add(CartItem(cart_id=cart.id, product_id=payload.product_id, quantity=payload.quantity))

    session.commit()
    return _serialize_cart(session, cart)


@router.patch("/items/{item_id}", response_model=CartRead)
def update_item(item_id: uuid.UUID, payload: CartItemUpdate, session: Session = Depends(get_session)):
    cart = _get_or_create_guest_cart(session)
    item = session.get(CartItem, item_id)
    if not item or item.cart_id != cart.id:
        raise HTTPException(status_code=404, detail="Cart item not found")

    product = session.get(Product, item.product_id)
    if product.stock < payload.quantity:
        raise HTTPException(status_code=409, detail=f"Only {product.stock} in stock")

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
