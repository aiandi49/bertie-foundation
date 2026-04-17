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
    """Create a new payment and return the Cash App payment URL"""
    try:
        # Get the Cash App cashtag from secrets
        cashtag = os.environ.get("CASHAPP_CASHTAG")
        
        if not cashtag:
            raise HTTPException(
                status_code=500,
                detail="Cash App $cashtag not configured"
            )

        # Remove $ if present in cashtag
        cashtag = cashtag.strip('$')

        # Create direct Cash App payment URL
        # Format: https://cash.app/$cashtag/amount
        payment_url = f"https://cash.app/${cashtag}/{payment.amount}"

        return PaymentResponse(payment_url=payment_url)

    except Exception as e:
        print(f"Error processing payment: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
