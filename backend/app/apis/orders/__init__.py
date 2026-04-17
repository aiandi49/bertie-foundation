from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import smtplib, os, uuid
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.db.supabase_client import get_supabase

router = APIRouter()

SMTP_HOST = os.environ.get("SMTP_HOST", "mail.bertiefoundation.org")
SMTP_PORT = 465
SMTP_FROM = os.environ.get("SMTP_EMAIL", "info@bertiefoundation.org")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

def _send_email(to, subject, html):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Bertie Foundation <{SMTP_FROM}>"
        msg["To"] = to
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as s:
            s.login(SMTP_FROM, SMTP_PASSWORD)
            s.sendmail(SMTP_FROM, to, msg.as_string())
    except Exception as e:
        print(f"Email error: {e}")

class CustomerInfo(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    preferred_contact: Optional[str] = None

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    special_instructions: Optional[str] = None

class AppointmentInfo(BaseModel):
    requested_date: Optional[str] = None
    requested_time: Optional[str] = None
    service_type: Optional[str] = None
    notes: Optional[str] = None

class Order(BaseModel):
    order_id: str
    customer: CustomerInfo
    items: List[OrderItem]
    total_amount: float
    appointment: Optional[AppointmentInfo] = None
    status: str = "pending"
    created_at: str
    conversation_id: str

@router.post("/create")
async def create_order(order: Order) -> Order:
    try:
        supabase = get_supabase()
        supabase.table("orders").insert(order.dict()).execute()
        _send_email(order.customer.email, f"Order Confirmation #{order.order_id}", f"<h2>Thank you, {order.customer.name}!</h2><p>Your order #{order.order_id} has been received.</p>")
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_orders() -> List[dict]:
    try:
        supabase = get_supabase()
        return supabase.table("orders").select("*").order("created_at", desc=True).execute().data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get/{order_id}")
async def get_order(order_id: str) -> dict:
    try:
        supabase = get_supabase()
        result = supabase.table("orders").select("*").eq("order_id", order_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Order not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def send_order_emails(order: Order):
    _send_email(order.customer.email, f"Order Confirmation #{order.order_id}", f"<h2>Thank you, {order.customer.name}!</h2><p>Order #{order.order_id} received. Total: ${order.total_amount}</p>")
