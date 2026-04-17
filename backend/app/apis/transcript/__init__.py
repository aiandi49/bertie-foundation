from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import os
import databutton as db
from openai import OpenAI
import json
from datetime import datetime
import uuid
from ..orders import Order, OrderItem, CustomerInfo, AppointmentInfo

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
    """Process transcript using AI to extract detailed information"""
    try:
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        prompt = f"""Analyze this conversation and extract the following information:
        1. Brief summary of the conversation
        2. Main categories discussed
        3. Overall sentiment
        4. Customer information (name, email, phone, preferred contact method)
        5. Order details (products, quantities, prices)
        6. Appointment details if any (requested date, time, service type)
        
        Format the response as a JSON object with these keys and types:
        {{
            "summary": "string describing the conversation",
            "categories": ["string1", "string2"],
            "sentiment": "string (positive/negative/neutral)",
            "customer_info": {{
                "name": "string",
                "email": "string",
                "phone": "string or null",
                "preferred_contact": "string or null"
            }},
            "orders": [
                {{
                    "product_id": "string",
                    "product_name": "string",
                    "quantity": number,
                    "price": number,
                    "special_instructions": "string or null"
                }}
            ],
            "appointment": {{
                "requested_date": "string or null",
                "requested_time": "string or null",
                "service_type": "string or null",
                "notes": "string or null"
            }}
        }}
        
        Conversation:
        {text}
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{
                "role": "system",
                "content": "You are a helpful assistant that analyzes conversations and extracts detailed order and customer information."
            }, {
                "role": "user",
                "content": prompt
            }],
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        try:
            return json.loads(response.choices[0].message.content)
        except json.JSONDecodeError as e:
            print(f"Error parsing AI response: {e}")
            return {
                "summary": "Error processing transcript",
                "categories": [],
                "sentiment": "neutral",
                "customer_info": None,
                "orders": [],
                "appointment": None
            }
            
    except Exception as e:
        print(f"Error processing with AI: {e}")
        return {
            "summary": "Error processing transcript",
            "categories": [],
            "sentiment": "neutral",
            "customer_info": None,
            "orders": [],
            "appointment": None
        }

@router.post("/process")
async def process_transcript(request: TranscriptRequest) -> ProcessedTranscript:
    """Process a transcript from Play.ai and create order if applicable"""
    try:
        # Process with AI
        analysis = process_transcript_with_ai(request.transcript)
        
        # Create processed result
        result = ProcessedTranscript(
            session_id=request.session_id,
            summary=analysis.get("summary", ""),
            categories=analysis.get("categories", []),
            sentiment=analysis.get("sentiment", "neutral"),
            customer_info=CustomerInfo(**analysis["customer_info"]) if analysis.get("customer_info") else None,
            order_details=[OrderItem(**order) for order in analysis.get("orders", [])],
            appointment_info=AppointmentInfo(**analysis["appointment"]) if analysis.get("appointment") else None,
            processed_at=datetime.utcnow().isoformat()
        )
        
        # Store the processed transcript
        processed_transcripts = db.storage.json.get(
            "processed_transcripts", 
            default={}
        )
        processed_transcripts[request.session_id] = result.dict()
        db.storage.json.put("processed_transcripts", processed_transcripts)
        
        # If we have both customer info and order details, create an order
        if result.customer_info and result.order_details:
            # Calculate total amount
            total_amount = sum(item.price * item.quantity for item in result.order_details)
            
            # Create order
            order = Order(
                order_id=f"ORD-{uuid.uuid4().hex[:8]}",
                customer=result.customer_info,
                items=result.order_details,
                total_amount=total_amount,
                appointment=result.appointment_info,
                created_at=result.processed_at,
                conversation_id=request.session_id
            )
            
            # Store and process order
            orders = db.storage.json.get("orders", default={})
            orders[order.order_id] = order.dict()
            db.storage.json.put("orders", orders)
            
            # Send notifications
            from ..orders import send_order_emails
            send_order_emails(order)
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/get/{session_id}")
async def get_processed_transcript(session_id: str) -> ProcessedTranscript:
    """Get a processed transcript by session ID"""
    try:
        processed_transcripts = db.storage.json.get(
            "processed_transcripts", 
            default={}
        )
        
        if session_id not in processed_transcripts:
            raise HTTPException(status_code=404, detail="Transcript not found")
            
        return ProcessedTranscript(**processed_transcripts[session_id])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
