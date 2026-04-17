from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os, json, uuid
from datetime import datetime
from app.db.supabase_client import get_supabase
from app.apis.orders import CustomerInfo, OrderItem, AppointmentInfo, Order, send_order_emails

router = APIRouter()

class TranscriptRequest(BaseModel):
    session_id: str
    transcript: str

class ProcessedTranscript(BaseModel):
    session_id: str
    summary: str
    categories: List[str]
    sentiment: str
    customer_info: Optional[CustomerInfo] = None
    order_details: Optional[List[OrderItem]] = None
    appointment_info: Optional[AppointmentInfo] = None
    processed_at: str

def process_transcript_with_ai(text: str) -> dict:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Extract conversation info as JSON. Return only JSON with keys: summary, categories, sentiment, customer_info, orders, appointment"},
                {"role": "user", "content": f"Extract from:\n{text}"}
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"AI processing error: {e}")
        return {"summary": "Could not process", "categories": [], "sentiment": "neutral", "customer_info": None, "orders": [], "appointment": None}

@router.post("/process")
async def process_transcript(request: TranscriptRequest) -> ProcessedTranscript:
    try:
        supabase = get_supabase()
        analysis = process_transcript_with_ai(request.transcript)
        result = ProcessedTranscript(
            session_id=request.session_id,
            summary=analysis.get("summary", ""),
            categories=analysis.get("categories", []),
            sentiment=analysis.get("sentiment", "neutral"),
            customer_info=CustomerInfo(**analysis["customer_info"]) if analysis.get("customer_info") else None,
            order_details=[OrderItem(**o) for o in analysis.get("orders", [])],
            appointment_info=AppointmentInfo(**analysis["appointment"]) if analysis.get("appointment") else None,
            processed_at=datetime.utcnow().isoformat(),
        )
        supabase.table("processed_transcripts").insert({**result.dict(), "session_id": request.session_id}).execute()
        if result.customer_info and result.order_details:
            total = sum(i.price * i.quantity for i in result.order_details)
            order = Order(order_id=f"ORD-{uuid.uuid4().hex[:8]}", customer=result.customer_info, items=result.order_details, total_amount=total, appointment=result.appointment_info, created_at=result.processed_at, conversation_id=request.session_id)
            supabase.table("orders").insert(order.dict()).execute()
            send_order_emails(order)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get/{session_id}")
async def get_processed_transcript(session_id: str) -> dict:
    try:
        supabase = get_supabase()
        result = supabase.table("processed_transcripts").select("*").eq("session_id", session_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Transcript not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
