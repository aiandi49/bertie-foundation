import React, { useEffect, useState } from "react";
import { Campaign } from "../utils/campaignTypes";
import { useCampaignStore } from "../utils/campaignStore";
import { Clock, Heart, ArrowUp, Users, Gift } from "lucide-react";

interface Props {
  campaignId?: string;
  showRecent?: boolean;
  showImpact?: boolean;
  className?: string;
}

export function CampaignProgressTracker({ 
  campaignId, 
  showRecent = true, 
  showImpact = true,
  className = ""
}: Props) {
  const { getCampaign, activeCampaigns, fetchActiveCampaigns } = useCampaignStore();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadCampaign = async () => {
      setLoading(true);
      try {
        if (campaignId) {
          // Fetch specific campaign
          const result = await getCampaign(campaignId);
          if (result) setCampaign(result);
        } else {
          // Get first active campaign
          await fetchActiveCampaigns();
        }
      } catch (error) {
        console.error("Error loading campaign:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCampaign();
  }, [campaignId, getCampaign, fetchActiveCampaigns]);
  
  // If no specific campaign ID is provided, use the first active campaign
  useEffect(() => {
    if (!campaignId && activeCampaigns.length > 0 && !campaign) {
      setCampaign(activeCampaigns[0]);
    }
  }, [campaignId, activeCampaigns, campaign]);
  
  if (loading) {
    return (
      <div className={`bg-secondary-800 rounded-lg p-6 ${className}`}>
        <div className="h-4 bg-secondary-700 rounded animate-pulse mb-4"></div>
        <div className="h-8 bg-secondary-700 rounded animate-pulse mb-2"></div>
        <div className="h-4 bg-secondary-700 rounded animate-pulse w-3/4"></div>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className={`bg-secondary-800 rounded-lg p-6 text-center ${className}`}>
        <p className="text-gray-400">No active fundraising campaigns available.</p>
      </div>
    );
  }
  
  // Calculate percentage complete
  const percentage = Math.min(Math.round((campaign.current_amount / campaign.goal_amount) * 100), 100);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate time remaining if end date exists
  const getTimeRemaining = () => {
    if (!campaign.end_date) return null;
    
    const endDate = new Date(campaign.end_date);
    const now = new Date();
    
    if (endDate <= now) return "Campaign ended";
    
    const diffTime = Math.abs(endDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day remaining";
    return `${diffDays} days remaining`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  
  return (
    <div className={`bg-secondary-800 rounded-lg overflow-hidden shadow-lg border border-secondary-700 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-secondary-900 p-4 border-b border-secondary-700">
        <h3 className="text-xl font-bold text-white mb-1">{campaign.title}</h3>
        <p className="text-gray-300 text-sm">{campaign.description}</p>
      </div>
      
      {/* Progress bar */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-lg font-semibold text-white">
            {formatCurrency(campaign.current_amount)} <span className="text-gray-400 text-sm">raised of {formatCurrency(campaign.goal_amount)} goal</span>
          </div>
          <div className="text-primary-400 font-bold">{percentage}%</div>
        </div>
        
        <div className="w-full h-4 bg-secondary-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-primary-300 transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-4">
          {campaign.end_date && (
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-primary-400" />
              <span>{getTimeRemaining()}</span>
            </div>
          )}
          
          {/* Show most recent donation */}
          {campaign.recent_donations && campaign.recent_donations.length > 0 && (
            <div className="flex items-center gap-2 text-gray-300">
              <Heart className="w-4 h-4 text-primary-400" />
              <span>Latest: {formatCurrency(campaign.recent_donations[0].amount)} from {campaign.recent_donations[0].donor_name}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent activity */}
      {showRecent && campaign.recent_donations && campaign.recent_donations.length > 0 && (
        <div className="px-6 pb-4">
          <h4 className="text-lg font-semibold text-white mb-3">Recent Donations</h4>
          <div className="space-y-3">
            {campaign.recent_donations.map((donation, index) => (
              <div key={index} className="flex items-center p-3 rounded-lg bg-secondary-700 border border-secondary-600">
                <div className="mr-3 bg-primary-900 p-2 rounded-full">
                  <ArrowUp className="w-4 h-4 text-primary-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-white">{donation.donor_name}</span>
                    <span className="font-bold text-primary-400">{formatCurrency(donation.amount)}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(donation.timestamp)} at {formatTime(donation.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Impact metrics */}
      {showImpact && campaign.impact_metrics && Object.keys(campaign.impact_metrics).length > 0 && (
        <div className="border-t border-secondary-700 px-6 py-4 bg-secondary-850">
          <h4 className="text-lg font-semibold text-white mb-3">Your Impact</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(campaign.impact_metrics).map(([key, value], index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary-800 border border-secondary-700">
                <div className="text-primary-400">
                  {index % 2 === 0 ? <Gift className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-sm text-gray-400">{key}</div>
                  <div className="font-semibold text-white">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
