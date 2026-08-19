import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from app.core.database import get_session
from app.models.order import Order, OrderItem, ORDER_STATUSES
from app.models.cart import CartItem
from app.models.product import Product
from app.schemas.order import (
    OrderCreate,
    OrderStatusUpdate,
    OrderRead,
    OrderItemRead,
    PaginatedOrders,
)
from app.routers.cart import _get_or_create_guest_cart

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _serialize_order(session: Session, order: Order) -> OrderRead:
    items = session.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
    item_reads = []
    for item in items:
        product = session.get(Product, item.product_id)
        line_total = item.price_at_purchase * item.quantity
        item_reads.append(
            OrderItemRead(
                id=item.id,
                product=product,
                quantity=item.quantity,
                price_at_purchase=item.price_at_purchase,
                line_total=line_total,
            )
        )
    return OrderRead(
        id=order.id,
        status=order.status,
        subtotal=order.subtotal,
        shipping_address=order.shipping_address,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=item_reads,
        item_count=sum(i.quantity for i in items),
    )


@router.get("", response_model=PaginatedOrders)
def list_orders(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status: str | None = None,
    session: Session = Depends(get_session),
):
    """Order history for the guest user — same no-auth seam as cart.py.
    Phase 4's session_id strategy replaces this the same way it replaces
    _get_or_create_guest_cart."""
    cart = _get_or_create_guest_cart(session)  # resolves the guest user_id consistently
    statement = select(Order).where(Order.user_id == cart.user_id).order_by(Order.created_at.desc())
    if status:
        if status not in ORDER_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {ORDER_STATUSES}")
        statement = statement.where(Order.status == status)

    total = session.exec(select(func.count()).select_from(statement.subquery())).one()
    orders = session.exec(statement.offset((page - 1) * page_size).limit(page_size)).all()

    return PaginatedOrders(
        items=[_serialize_order(session, o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: uuid.UUID, session: Session = Depends(get_session)):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _serialize_order(session, order)


@router.post("", response_model=OrderRead, status_code=201)
def create_order(payload: OrderCreate, session: Session = Depends(get_session)):
    """Checkout — turns the current guest cart into an order. Mirrors the
    guide's Phase 9 checkout step: this endpoint just does the transaction;
    the "no place_order without explicit confirmation" rule belongs one layer
    up, in the chat/agent tool router, not here."""
    cart = _get_or_create_guest_cart(session)
    cart_items = session.exec(select(CartItem).where(CartItem.cart_id == cart.id)).all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty — nothing to order")

    # Validate stock for every line BEFORE writing anything, so a failure
    # partway through never leaves stock decremented for only some items.
    products_by_id = {}
    for ci in cart_items:
        product = session.get(Product, ci.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {ci.product_id} no longer exists")
        if product.stock < ci.quantity:
            raise HTTPException(
                status_code=409,
                detail=f"Only {product.stock} left in stock for '{product.name}'",
            )
        products_by_id[ci.product_id] = product

    subtotal = sum(products_by_id[ci.product_id].price * ci.quantity for ci in cart_items)

    order = Order(user_id=cart.user_id, subtotal=subtotal, shipping_address=payload.shipping_address)
    session.add(order)
    session.commit()
    session.refresh(order)

    for ci in cart_items:
        product = products_by_id[ci.product_id]
        session.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=ci.quantity,
                price_at_purchase=product.price,  # snapshot — future price changes don't affect this order
            )
        )
        product.stock -= ci.quantity
        session.add(product)

    # Clear the cart now that it's been converted into an order — leave the
    # Cart row itself intact so the guest keeps a single stable cart id.
    for ci in cart_items:
        session.delete(ci)

    session.commit()
    session.refresh(order)
    return _serialize_order(session, order)


@router.patch("/{order_id}", response_model=OrderRead)
def update_order_status(order_id: uuid.UUID, payload: OrderStatusUpdate, session: Session = Depends(get_session)):
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if payload.status not in ORDER_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {ORDER_STATUSES}")
    if order.status == "cancelled":
        raise HTTPException(status_code=409, detail="Cannot change status of a cancelled order")

    order.status = payload.status
    order.updated_at = datetime.utcnow()
    session.add(order)
    session.commit()
    session.refresh(order)
    return _serialize_order(session, order)


@router.delete("/{order_id}", response_model=OrderRead)
def cancel_order(order_id: uuid.UUID, session: Session = Depends(get_session)):
    """"Delete" here means cancel-and-restock, not a hard row delete — that's
    the correct real-world behavior for an order (you keep the record), even
    though the verb is DELETE for REST/CRUD consistency with the other routers."""
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status not in ("pending", "confirmed"):
        raise HTTPException(status_code=409, detail=f"Cannot cancel an order that is already '{order.status}'")

    items = session.exec(select(OrderItem).where(OrderItem.order_id == order.id)).all()
    for item in items:
        product = session.get(Product, item.product_id)
        if product:
            product.stock += item.quantity
            session.add(product)

    order.status = "cancelled"
    order.updated_at = datetime.utcnow()
    session.add(order)
    session.commit()
    session.refresh(order)
    return _serialize_order(session, order)
