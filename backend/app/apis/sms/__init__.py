from fastapi import APIRouter, HTTPException
import os

router = APIRouter()

def send_sms(to_number: str, message: str):
    try:
        from twilio.rest import Client
        account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
        from_number = os.environ.get("TWILIO_PHONE_NUMBER")
        if not all([account_sid, auth_token, from_number]):
            print("Twilio credentials not configured")
            return
        client = Client(account_sid, auth_token)
        msg = client.messages.create(body=message, from_=from_number, to=to_number)
        print(f"SMS sent: {msg.sid}")
    except Exception as e:
        print(f"Error sending SMS: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def send_order_sms(order_id: str, phone: str, status: str):
    messages = {
        "pending": f"Your order {order_id} has been received.",
        "confirmed": f"Your order {order_id} is confirmed!",
        "fulfilled": f"Your order {order_id} is complete. Thank you!",
        "cancelled": f"Your order {order_id} has been cancelled."
    }
    if status in messages:
        send_sms(phone, messages[status])
