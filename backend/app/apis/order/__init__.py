from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import databutton as db
import uuid
from app.apis.email_notifications import send_form_notifications

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
    donation_type: str = "one-time" # or "monthly"
    message: Optional[str] = None
    payment_method: str = "card"

class OrderResponse(BaseModel):
    order_id: str
    total_amount: float
    status: str
    created_at: str

@router.post("/orders")
def create_donation_order(order: OrderRequest) -> OrderResponse:
    """Create a new donation order"""
    try:
        # Generate a unique order ID
        order_id = f"order_{uuid.uuid4().hex[:8]}"
        
        # Calculate total amount
        total_amount = sum(item.amount * item.quantity for item in order.items)
        
        # Create order object
        order_data = {
            "id": order_id,
            "customer_name": order.customer_name,
            "customer_email": order.customer_email,
            "items": [item.dict() for item in order.items],
            "total_amount": total_amount,
            "donation_type": order.donation_type,
            "message": order.message,
            "payment_method": order.payment_method,
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }
        
        # Store the order
        orders = db.storage.json.get("orders", default=[])
        orders.append(order_data)
        db.storage.json.put("orders", orders)
        
        # Send notification emails using the unified system
        try:
            notification_data = {
                "order_id": order_id,
                "customer_name": order.customer_name,
                "customer_email": order.customer_email,
                "items": [item.dict() for item in order.items],
                "total_amount": total_amount,
                "donation_type": order.donation_type,
                "message": order.message,
                "payment_method": order.payment_method,
                "created_at": order_data["created_at"]
            }
            
            send_form_notifications("donation", notification_data)
        except Exception as e:
            print(f"Error sending notification emails: {e}")
            # Continue even if email sending fails
        
        return OrderResponse(
            order_id=order_id,
            total_amount=total_amount,
            status="pending",
            created_at=order_data["created_at"]
        )
    except Exception as e:
        print(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders")
def list_donation_orders():
    """List all donation orders"""
    try:
        orders = db.storage.json.get("orders", default=[])
        return sorted(orders, key=lambda x: x.get("created_at", ""), reverse=True)
    except Exception as e:
        print(f"Error listing orders: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders/{order_id}")
def get_donation_order(order_id: str):
    """Get a specific donation order by ID"""
    try:
        orders = db.storage.json.get("orders", default=[])
        order = next((o for o in orders if o.get("id") == order_id), None)
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
            
        return order
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving order: {e}")
        raise HTTPException(status_code=500, detail=str(e))
