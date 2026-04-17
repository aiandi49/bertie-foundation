from fastapi import APIRouter, HTTPException
from twilio.rest import Client
import os

router = APIRouter()

def send_sms(to_number: str, message: str):
    """Send SMS using Twilio"""
    try:
        # Get Twilio credentials from environment variables
        account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
        from_number = os.environ.get("TWILIO_PHONE_NUMBER")
        
        if not all([account_sid, auth_token, from_number]):
            print("Twilio credentials not configured")
            return
        
        client = Client(account_sid, auth_token)
        
        message = client.messages.create(
            body=message,
            from_=from_number,
            to=to_number
        )
        
        print(f"SMS sent: {message.sid}")
        
    except Exception as e:
        print(f"Error sending SMS: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e

def send_order_sms(order_id: str, phone: str, status: str):
    """Send order status SMS to customer"""
    status_messages = {
        "pending": "Your order {order_id} has been received and is being processed.",
        "confirmed": "Your order {order_id} is confirmed! We'll see you at your scheduled time.",
        "fulfilled": "Your order {order_id} has been completed. Thank you for your business!",
        "cancelled": "Your order {order_id} has been cancelled. Please contact us if you have any questions."
    }
    
    if status in status_messages:
        message = status_messages[status].format(order_id=order_id)
        send_sms(phone, message)
