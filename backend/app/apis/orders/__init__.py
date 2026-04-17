from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import databutton as db
from ..sms import send_order_sms
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

router = APIRouter()

# SMTP configuration (reuse same env vars as email_notifications)
SMTP_HOST = os.environ.get("SMTP_HOST", "mail.bertiefoundation.org")
SMTP_PORT = 465
SMTP_FROM = os.environ.get("SMTP_EMAIL", "info@bertiefoundation.org")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

def _send_email(to: str, subject: str, content_html: str) -> bool:
    """Send a single email via SMTP SSL on port 465."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Bertie Foundation <{SMTP_FROM}>"
        msg["To"] = to
        msg.attach(MIMEText(content_html, "html"))
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(SMTP_FROM, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, to, msg.as_string())
        print(f"Order email sent to {to}")
        return True
    except Exception as e:
        print(f"Error sending order email to {to}: {e}")
        return False

class CustomerInfo(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    preferred_contact: Optional[str] = None  # 'email', 'phone', or 'text'

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
    status: str = "pending"  # pending, confirmed, fulfilled, cancelled
    created_at: str
    conversation_id: str

def send_order_emails(order: Order):
    """Send emails to all parties involved"""
    try:
        # Customer email
        customer_html = f"""
        <h2>Order Confirmation #{order.order_id}</h2>
        <p>Thank you for your order, {order.customer.name}!</p>
        <h3>Order Details:</h3>
        <ul>
        {''.join([f'<li>{item.quantity}x {item.product_name} - ${item.price * item.quantity}</li>' for item in order.items])}
        </ul>
        <p><strong>Total Amount:</strong> ${order.total_amount}</p>
        {'<h3>Appointment Details:</h3>' + f'<p>Date: {order.appointment.requested_date}<br>Time: {order.appointment.requested_time}</p>' if order.appointment else ''}
        """

        # Partner email
        partner_html = f"""
        <h2>New Order #{order.order_id}</h2>
        <h3>Customer Information:</h3>
        <p>
        Name: {order.customer.name}<br>
        Email: {order.customer.email}<br>
        Phone: {order.customer.phone or 'Not provided'}
        </p>
        <h3>Order Details:</h3>
        <ul>
        {''.join([f'<li>{item.quantity}x {item.product_name}<br>Special Instructions: {item.special_instructions or "None"}</li>' for item in order.items])}
        </ul>
        """

        # Owner email
        owner_html = f"""
        <h2>New Order Alert #{order.order_id}</h2>
        <p>A new order has been placed through your AI agent.</p>
        <h3>Customer Information:</h3>
        <p>
        Name: {order.customer.name}<br>
        Email: {order.customer.email}<br>
        Phone: {order.customer.phone or 'Not provided'}<br>
        Preferred Contact: {order.customer.preferred_contact or 'Not specified'}
        </p>
        <h3>Order Details:</h3>
        <ul>
        {''.join([f'<li>{item.quantity}x {item.product_name} - ${item.price * item.quantity}<br>Special Instructions: {item.special_instructions or "None"}</li>' for item in order.items])}
        </ul>
        <p><strong>Total Amount:</strong> ${order.total_amount}</p>
        {'<h3>Appointment Details:</h3>' + f'<p>Date: {order.appointment.requested_date}<br>Time: {order.appointment.requested_time}<br>Service: {order.appointment.service_type}<br>Notes: {order.appointment.notes}</p>' if order.appointment else ''}
        """

        # Send customer email
        _send_email(order.customer.email, f"Order Confirmation #{order.order_id}", customer_html)

        partner_email = os.environ.get("PARTNER_EMAIL")
        if partner_email:
            _send_email(partner_email, f"New Order #{order.order_id} Needs Fulfillment", partner_html)

        owner_email = os.environ.get("OWNER_EMAIL")
        if owner_email:
            _send_email(owner_email, f"New Order Alert #{order.order_id}", owner_html)

    except Exception as e:
        print(f"Error sending order emails: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.post("/create")
async def create_order(order: Order) -> Order:
    """Create a new order and send notifications"""
    try:
        # Store the order
        orders = db.storage.json.get("orders", default={})
        orders[order.order_id] = order.dict()
        db.storage.json.put("orders", orders)

        # Send notifications
        send_order_emails(order)
        
        # Send SMS if phone number is provided and preferred contact includes SMS/text
        if order.customer.phone and order.customer.preferred_contact in ["text", "sms", "both"]:
            send_order_sms(order.order_id, order.customer.phone, order.status)

        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/list")
async def list_orders() -> List[Order]:
    """List all orders"""
    try:
        orders = db.storage.json.get("orders", default={})
        return [Order(**order) for order in orders.values()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/get/{order_id}")
async def get_order(order_id: str) -> Order:
    """Get a specific order"""
    try:
        orders = db.storage.json.get("orders", default={})
        if order_id not in orders:
            raise HTTPException(status_code=404, detail="Order not found")
        return Order(**orders[order_id])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
