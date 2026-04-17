from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os

router = APIRouter()

class PaymentRequest(BaseModel):
    amount: float
    currency: str = "USD"
    description: Optional[str] = None
    customer_email: Optional[str] = None

class PaymentResponse(BaseModel):
    payment_url: str

@router.post("/payments/create")
def create_payment(payment: PaymentRequest) -> PaymentResponse:
    try:
        cashtag = os.environ.get("CASHAPP_CASHTAG")
        if not cashtag:
            raise HTTPException(status_code=500, detail="Cash App $cashtag not configured")
        cashtag = cashtag.strip('$')
        payment_url = f"https://cash.app/${cashtag}/{payment.amount}"
        return PaymentResponse(payment_url=payment_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
