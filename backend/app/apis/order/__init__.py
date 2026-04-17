from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid
from app.apis.email_notifications import send_form_notifications
from app.db.supabase_client import get_supabase

router = APIRouter()

class OrderItem(BaseModel):
    name: str
    description: Optional[str] = None
    amount: float
    quantity: int = 1

class OrderRequest(BaseModel):
    customer_name: str
    customer_email: EmailStr
    items: List[OrderItem]
    donation_type: str = "one-time"
    message: Optional[str] = None
    payment_method: str = "card"

class OrderResponse(BaseModel):
    order_id: str
    total_amount: float
    status: str
    created_at: str

@router.post("/orders")
def create_donation_order(order: OrderRequest) -> OrderResponse:
    try:
        supabase = get_supabase()
        order_id = f"order_{uuid.uuid4().hex[:8]}"
        total_amount = sum(item.amount * item.quantity for item in order.items)
        data = {"id": order_id, "customer_name": order.customer_name, "customer_email": order.customer_email, "items": [i.dict() for i in order.items], "total_amount": total_amount, "donation_type": order.donation_type, "message": order.message, "payment_method": order.payment_method, "status": "pending", "created_at": datetime.now().isoformat()}
        supabase.table("donation_orders").insert(data).execute()
        try:
            send_form_notifications("donation", {"name": order.customer_name, "email": order.customer_email, "amount": total_amount, "submitted_at": data["created_at"]})
        except Exception as e:
            print(f"Email error: {e}")
        return OrderResponse(order_id=order_id, total_amount=total_amount, status="pending", created_at=data["created_at"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders")
def list_donation_orders() -> List[dict]:
    try:
        supabase = get_supabase()
        return supabase.table("donation_orders").select("*").order("created_at", desc=True).execute().data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
