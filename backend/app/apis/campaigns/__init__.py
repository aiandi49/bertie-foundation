from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
import uuid
from app.db.supabase_client import get_supabase

router = APIRouter()

class CampaignCreate(BaseModel):
    title: str
    description: str
    goal_amount: float
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    impact_metrics: Dict[str, str] = {}

class DonationUpdate(BaseModel):
    amount: float
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None

@router.post("/campaigns")
def create_campaign(c: CampaignCreate) -> dict:
    try:
        supabase = get_supabase()
        data = {"id": str(uuid.uuid4()), "title": c.title, "description": c.description, "goal_amount": c.goal_amount, "current_amount": 0, "start_date": c.start_date or datetime.now().isoformat(), "end_date": c.end_date, "is_active": True, "recent_donations": [], "impact_metrics": c.impact_metrics}
        result = supabase.table("campaigns").insert(data).execute()
        return result.data[0] if result.data else data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaigns")
def list_campaigns(active_only: bool = False) -> List[dict]:
    try:
        supabase = get_supabase()
        query = supabase.table("campaigns").select("*").order("start_date", desc=True)
        if active_only:
            query = query.eq("is_active", True)
        return query.execute().data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaigns/{campaign_id}")
def get_campaign(campaign_id: str) -> dict:
    try:
        supabase = get_supabase()
        result = supabase.table("campaigns").select("*").eq("id", campaign_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/campaigns/{campaign_id}/donate")
def add_donation_to_campaign(campaign_id: str, donation: DonationUpdate) -> dict:
    try:
        supabase = get_supabase()
        result = supabase.table("campaigns").select("*").eq("id", campaign_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        campaign = result.data[0]
        new_amount = campaign.get("current_amount", 0) + donation.amount
        recent = campaign.get("recent_donations", [])
        recent.append({"amount": donation.amount, "donor_name": donation.donor_name or "Anonymous", "timestamp": datetime.now().isoformat()})
        recent = sorted(recent, key=lambda x: x.get("timestamp",""), reverse=True)[:5]
        updated = supabase.table("campaigns").update({"current_amount": new_amount, "recent_donations": recent}).eq("id", campaign_id).execute()
        return updated.data[0] if updated.data else campaign
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
