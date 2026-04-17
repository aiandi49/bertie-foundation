from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import databutton as db
import uuid
import re

router = APIRouter()

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

class DonationUpdate(BaseModel):
    amount: float
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None
    timestamp: Optional[str] = None

class Campaign(BaseModel):
    id: str
    title: str
    description: str
    goal_amount: float
    current_amount: float = 0
    start_date: str
    end_date: Optional[str] = None
    is_active: bool = True
    recent_donations: List[Dict[str, Any]] = []
    impact_metrics: Dict[str, str] = {}

class CampaignCreate(BaseModel):
    title: str
    description: str
    goal_amount: float
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    impact_metrics: Dict[str, str] = {}

class CampaignUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    goal_amount: Optional[float] = None
    current_amount: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_active: Optional[bool] = None
    impact_metrics: Optional[Dict[str, str]] = None

@router.post("/campaigns")
def create_campaign(campaign: CampaignCreate):
    """Create a new fundraising campaign"""
    try:
        # Generate unique ID
        campaign_id = f"campaign_{uuid.uuid4().hex[:8]}"
        
        # Set default start date if not provided
        start_date = campaign.start_date or datetime.now().isoformat()
        
        # Create campaign object
        new_campaign = Campaign(
            id=campaign_id,
            title=campaign.title,
            description=campaign.description,
            goal_amount=campaign.goal_amount,
            current_amount=0,
            start_date=start_date,
            end_date=campaign.end_date,
            is_active=True,
            recent_donations=[],
            impact_metrics=campaign.impact_metrics
        )
        
        # Get existing campaigns
        campaigns = db.storage.json.get(sanitize_storage_key("fundraising_campaigns"), default=[])
        
        # Add new campaign
        campaigns.append(new_campaign.dict())
        
        # Save updated campaigns
        db.storage.json.put(sanitize_storage_key("fundraising_campaigns"), campaigns)
        
        return new_campaign.dict()
    except Exception as e:
        print(f"Error creating campaign: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaigns")
def list_campaigns(active_only: bool = False):
    """List all fundraising campaigns"""
    try:
        campaigns = db.storage.json.get(sanitize_storage_key("fundraising_campaigns"), default=[])
        
        if active_only:
            # Filter to only include active campaigns
            now = datetime.now().isoformat()
            campaigns = [
                c for c in campaigns 
                if c.get("is_active", True) and 
                (not c.get("end_date") or c.get("end_date") > now)
            ]
        
        return sorted(campaigns, key=lambda x: x.get("start_date", ""), reverse=True)
    except Exception as e:
        print(f"Error listing campaigns: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaigns/{campaign_id}")
def get_campaign(campaign_id: str):
    """Get a specific campaign by ID"""
    try:
        campaigns = db.storage.json.get(sanitize_storage_key("fundraising_campaigns"), default=[])
        campaign = next((c for c in campaigns if c.get("id") == campaign_id), None)
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
            
        return campaign
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving campaign: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/campaigns/{campaign_id}")
def update_campaign(campaign_id: str, update: CampaignUpdate):
    """Update a campaign's details"""
    try:
        campaigns = db.storage.json.get(sanitize_storage_key("fundraising_campaigns"), default=[])
        
        # Find the campaign to update
        campaign_index = next((i for i, c in enumerate(campaigns) if c.get("id") == campaign_id), None)
        
        if campaign_index is None:
            raise HTTPException(status_code=404, detail="Campaign not found")
            
        # Get the campaign
        campaign = campaigns[campaign_index]
        
        # Update fields that are provided
        update_dict = {k: v for k, v in update.dict().items() if v is not None}
        campaign.update(update_dict)
        
        # Save updated campaigns
        db.storage.json.put(sanitize_storage_key("fundraising_campaigns"), campaigns)
        
        return campaign
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating campaign: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/campaigns/{campaign_id}/donate")
def add_donation_to_campaign(campaign_id: str, donation: DonationUpdate):
    """Add a donation to a campaign"""
    try:
        campaigns = db.storage.json.get(sanitize_storage_key("fundraising_campaigns"), default=[])
        
        # Find the campaign
        campaign_index = next((i for i, c in enumerate(campaigns) if c.get("id") == campaign_id), None)
        
        if campaign_index is None:
            raise HTTPException(status_code=404, detail="Campaign not found")
            
        # Get the campaign
        campaign = campaigns[campaign_index]
        
        # Check if campaign is active
        if not campaign.get("is_active", True):
            raise HTTPException(status_code=400, detail="Campaign is not active")
            
        # Check if campaign end date has passed
        if campaign.get("end_date") and campaign.get("end_date") < datetime.now().isoformat():
            raise HTTPException(status_code=400, detail="Campaign has ended")
        
        # Add donation amount to current amount
        campaign["current_amount"] = campaign.get("current_amount", 0) + donation.amount
        
        # Add donation to recent donations
        donation_record = {
            "amount": donation.amount,
            "donor_name": donation.donor_name or "Anonymous",
            "timestamp": donation.timestamp or datetime.now().isoformat()
        }
        
        # Keep only the 5 most recent donations
        recent_donations = campaign.get("recent_donations", [])
        recent_donations.append(donation_record)
        campaign["recent_donations"] = sorted(
            recent_donations, 
            key=lambda x: x.get("timestamp", ""), 
            reverse=True
        )[:5]
        
        # Save updated campaigns
        db.storage.json.put(sanitize_storage_key("fundraising_campaigns"), campaigns)
        
        return campaign
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding donation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/campaigns/{campaign_id}/reset")
def reset_campaign(campaign_id: str):
    """Reset a campaign's progress (for admin purposes)"""
    try:
        campaigns = db.storage.json.get(sanitize_storage_key("fundraising_campaigns"), default=[])
        
        # Find the campaign
        campaign_index = next((i for i, c in enumerate(campaigns) if c.get("id") == campaign_id), None)
        
        if campaign_index is None:
            raise HTTPException(status_code=404, detail="Campaign not found")
            
        # Reset the campaign progress
        campaigns[campaign_index]["current_amount"] = 0
        campaigns[campaign_index]["recent_donations"] = []
        
        # Save updated campaigns
        db.storage.json.put(sanitize_storage_key("fundraising_campaigns"), campaigns)
        
        return campaigns[campaign_index]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error resetting campaign: {e}")
        raise HTTPException(status_code=500, detail=str(e))
