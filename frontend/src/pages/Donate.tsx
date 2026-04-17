import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { DonationSection } from "../components/DonationSection";
import { CampaignProgressTracker } from "../components/CampaignProgressTracker";
import { useCampaignStore } from "../utils/campaignStore";
import { Campaign } from "../utils/campaignTypes";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Globe } from "lucide-react";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../utils/analytics";

export default function Donate() {
  const { activeCampaigns, fetchActiveCampaigns } = useCampaignStore();
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Track page view
    trackEvent({
      event_type: "page_view",
      component: "donate_page",
      action: "view"
    });
    
    // Fetch active campaigns
    fetchActiveCampaigns();
  }, [fetchActiveCampaigns]);
  
  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    trackEvent({
      event_type: "campaign_selection",
      component: "donate_page",
      action: "select_campaign",
      metadata: { campaign_id: campaignId }
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center rounded-full bg-primary-600/10 p-2 mb-4">
              <Heart className="h-5 w-5 text-primary-500" />
              <span className="ml-2 text-sm font-medium text-primary-500">Support Our Mission</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your Donation Makes a <span className="text-primary-400">Difference</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-6">
              Every contribution helps us create lasting impact in our community.
              Choose a specific campaign to support or make a general donation.
            </p>
          </motion.div>
        </div>
        
        {/* Campaign Selection Section */}
        {activeCampaigns.length > 0 && (
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Support Our Current Campaigns
              </h2>
              
              {/* Campaign Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {activeCampaigns.map((campaign) => (
                  <div 
                    key={campaign.id}
                    className={`bg-secondary-800 border rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 ${selectedCampaign === campaign.id ? 'border-primary-500 ring-2 ring-primary-500/30 transform scale-[1.02]' : 'border-secondary-700 hover:border-primary-500/50'}`}
                    onClick={() => handleCampaignSelect(campaign.id)}
                  >
                    <div className="p-5">
                      <h3 className="text-xl font-semibold text-white mb-2">{campaign.title}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{campaign.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500">Goal</p>
                          <p className="text-lg font-bold text-white">
                            ${campaign.goal_amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Raised</p>
                          <p className="text-lg font-bold text-primary-400">
                            ${campaign.current_amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Progress</p>
                          <p className="text-lg font-bold text-white">
                            {Math.round((campaign.current_amount / campaign.goal_amount) * 100)}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="w-full h-2 bg-secondary-700 rounded-full mt-4 overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 transition-all duration-1000"
                          style={{ width: `${Math.min(Math.round((campaign.current_amount / campaign.goal_amount) * 100), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* General Donation Option */}
                <div 
                  className={`bg-secondary-800 border rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300 ${selectedCampaign === null ? 'border-primary-500 ring-2 ring-primary-500/30 transform scale-[1.02]' : 'border-secondary-700 hover:border-primary-500/50'}`}
                  onClick={() => setSelectedCampaign(null)}
                >
                  <div className="p-5 flex flex-col h-full">
                    <div className="flex-1">
                      <div className="w-12 h-12 rounded-full bg-secondary-700 flex items-center justify-center mb-4">
                        <Globe className="w-6 h-6 text-primary-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">General Donation</h3>
                      <p className="text-gray-400 text-sm">
                        Support all of our work and let us allocate funds where they're needed most.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Selected Campaign Details */}
            {selectedCampaign && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto mb-12 overflow-hidden"
              >
                <CampaignProgressTracker 
                  campaignId={selectedCampaign} 
                  showRecent={true} 
                  showImpact={true} 
                />
              </motion.div>
            )}
          </div>
        )}
        
        {/* Donation Form Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <DonationSection campaignId={selectedCampaign} />
        </motion.div>
        
        {/* Other Ways to Support */}
        <div className="mt-16 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Other Ways to Support Our Mission
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Volunteer Your Time</h3>
                <p className="text-gray-400 mb-4">
                  Join our volunteer team and contribute your skills and time to making a difference in our community.
                </p>
                <Button 
                  onClick={() => navigate("/volunteer")}
                  variant="outline"
                  className="flex items-center"
                >
                  Become a Volunteer
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
              
              <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Sponsor a Program</h3>
                <p className="text-gray-400 mb-4">
                  Organizations can sponsor specific programs or events to help us reach more people in need.
                </p>
                <Button 
                  onClick={() => navigate("/contact")}
                  variant="outline"
                  className="flex items-center"
                >
                  Contact Us
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Main Content */}
        <div className="bg-secondary-900 rounded-b-lg p-6 md:p-10">
          {/* Donation Section */}
          <div className="mb-10">
            <DonationSection />
          </div>

          {/* Other Ways to Give */}
          <div className="border-t border-secondary-800 pt-10">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Other Ways to Give</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-secondary-800 rounded-lg border border-secondary-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Sponsor a Program</h3>
                <p className="text-gray-400 mb-4">
                  Support a specific initiative and see your contribution make a direct impact on our community.
                </p>
                <Button 
                  onClick={() => navigate("/contact-us")}
                  variant="outline"
                  className="flex items-center"
                >
                  Learn More
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
