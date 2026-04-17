import React, { useEffect, useCallback, useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import type { FC } from "react";
import { DonationSection } from "../components/DonationSection";
import { CampaignProgressTracker } from "../components/CampaignProgressTracker";
import { useCampaignStore } from "../utils/campaignStore";
import { Campaign } from "../utils/campaignTypes";
import { trackEvent } from "../utils/analytics";
import { ChevronDown, Heart, Users, TrendingUp, ArrowRight, Globe, Handshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Button } from "../components/Button";
import PastDonations from "../components/PastDonations";

export default function Impact() {
  const navigate = useNavigate();

  // Track page view and section visibility
  useEffect(() => {
    trackEvent("impact_page", "view");

    // Track scroll depth
    const handleScroll = () => {
      const scrollDepth = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
      if (scrollDepth > 25) trackEvent("impact_page", "scroll_depth_25");
      if (scrollDepth > 50) trackEvent("impact_page", "scroll_depth_50");
      if (scrollDepth > 75) trackEvent("impact_page", "scroll_depth_75");
      if (scrollDepth > 90) trackEvent("impact_page", "scroll_depth_90");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track CTA clicks
  const handleCTAClick = useCallback((action: string) => {
    trackEvent("impact_page", "cta_click", { action });
    if (action === "volunteer") navigate("/volunteer");
    if (action === "donate") {
      document.getElementById("donation-section")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [navigate]);
  
  // Fetch active campaigns
  const { fetchActiveCampaigns, activeCampaigns } = useCampaignStore();
  const [hasActiveCampaigns, setHasActiveCampaigns] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  
  useEffect(() => {
    const loadCampaigns = async () => {
      await fetchActiveCampaigns();
    };
    
    loadCampaigns();
  }, [fetchActiveCampaigns]);
  
  useEffect(() => {
    setHasActiveCampaigns(activeCampaigns.length > 0);
  }, [activeCampaigns]);

  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    trackEvent({
      event_type: "campaign_selection",
      component: "impact_page",
      action: "select_campaign",
      metadata: { campaign_id: campaignId }
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 py-12 px-4 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80"
            alt="Community Impact"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-500/10 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-3 gap-6">
              <motion.div
                className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Heart className="w-6 h-6 text-primary-400" />
              </motion.div>
              <motion.div
                className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Users className="w-6 h-6 text-primary-400" />
              </motion.div>
              <motion.div
                className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <TrendingUp className="w-6 h-6 text-primary-400" />
              </motion.div>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Creating <span className="text-primary-400">Lasting</span> Impact
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-6">
              Join us in building a stronger, more vibrant community. Your support powers
              meaningful change that transforms lives and creates lasting impact.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
              <motion.button
                onClick={() => handleCTAClick("donate")}
                className="px-6 py-3 bg-secondary-700 text-white rounded-lg font-medium text-base
                         hover:bg-secondary-600 transition-all duration-200 shadow-lg shadow-secondary-700/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Make a Donation
              </motion.button>
            </div>
            <motion.button
              onClick={() => document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary-400 transition-colors mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 10, 0] }}
              transition={{ delay: 1, duration: 2, repeat: Infinity }}
            >
              <span>Explore Our Impact</span>
              <ChevronDown className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div id="main-content" className="container mx-auto px-4 py-12 bg-secondary-950">
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
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your Donation Makes a <span className="text-primary-400">Difference</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-6">
              Every contribution helps us create lasting impact in our community.
              Choose a specific campaign to support or make a general donation.
            </p>
          </motion.div>
        </div>
        
        {/* Campaign Selection Section */}
        {hasActiveCampaigns && (
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
          id="donation-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <DonationSection campaignId={selectedCampaign} />
        </motion.div>
        
        {/* Past Donations Section */}
        <div className="mt-16">
          <PastDonations />
        </div>

        {/* Other Ways to Support */}
        <div className="mt-16 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-12 text-center">
              Other Ways to Support Our Mission
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sponsor Card */}
              <div className="bg-secondary-800/40 backdrop-blur-sm rounded-2xl border border-secondary-700/50 p-8 hover:border-primary-500/30 hover:bg-secondary-800/60 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/10">
                    <Handshake className="w-7 h-7 text-primary-400" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-4">Sponsor a Program</h3>
                <p className="text-gray-400 mb-8 leading-relaxed h-20">
                  Organizations can sponsor specific programs or events to help us reach more people in need. Make a lasting corporate impact today.
                </p>
                <Button 
                  onClick={() => navigate("/contact-us")}
                  variant="outline"
                  className="w-full flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all duration-300"
                >
                  Contact Us
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {/* Volunteer Card */}
              <div className="bg-secondary-800/40 backdrop-blur-sm rounded-2xl border border-secondary-700/50 p-8 hover:border-primary-500/30 hover:bg-secondary-800/60 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/10">
                    <Users className="w-7 h-7 text-primary-400" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-4">Volunteer Your Time</h3>
                <p className="text-gray-400 mb-8 leading-relaxed h-20">
                  Join our community of passionate volunteers. Whether for a single event or ongoing support, your time and skills make a difference.
                </p>
                <Button 
                  onClick={() => navigate("/contact-us")}
                  variant="outline"
                  className="w-full flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all duration-300"
                >
                  Join Us
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
