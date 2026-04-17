import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { Heart, DollarSign, Gift, Sparkles } from "lucide-react";
import { DonationConfirmationDialog } from "./DonationConfirmationDialog";
import { useCampaignStore } from "../utils/campaignStore";
import { Campaign } from "../utils/campaignTypes";



const DONATION_TIERS = [
  {
    amount: 25,
    title: "Friend",
    icon: Heart,
    color: "from-pink-500 to-rose-500"
  },
  {
    amount: 50,
    title: "Supporter",
    icon: Gift,
    color: "from-purple-500 to-indigo-500"
  },
  {
    amount: 100,
    title: "Champion",
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500"
  }
];

interface Props {
  campaignId?: string;
}

export function DonationSection({ campaignId }: Props = {}) {
  const [customAmount, setCustomAmount] = useState("");
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);
  const [selectedCampaignData, setSelectedCampaignData] = useState<Campaign | null>(null);
  
  // Get active campaigns
  const { activeCampaigns, fetchActiveCampaigns, getCampaign } = useCampaignStore();
  
  useEffect(() => {
    const loadCampaignData = async () => {
      if (campaignId) {
        // Fetch specific campaign if ID is provided
        const result = await getCampaign(campaignId);
        if (result) setSelectedCampaignData(result);
      } else {
        // Otherwise load active campaigns and use the first one
        await fetchActiveCampaigns();
      }
    };
    
    loadCampaignData();
  }, [campaignId, fetchActiveCampaigns, getCampaign]);
  
  // If no specific campaign ID, use the first active campaign
  useEffect(() => {
    if (!campaignId && activeCampaigns.length > 0 && !selectedCampaignData) {
      setSelectedCampaignData(activeCampaigns[0]);
    }
  }, [campaignId, activeCampaigns, selectedCampaignData]);

  const openConfirmationDialog = (amount: number) => {
    setDonationAmount(amount);
    setConfirmationDialogOpen(true);
  };

  const handlePayPalRedirect = () => {
    // Use PayPal Payments Standard which supports dynamic amount via URL params
    const baseUrl = "https://www.paypal.com/cgi-bin/webscr";
    const params = new URLSearchParams({
      cmd: "_donations",
      business: "finance@bertiefoundation.org", // Bertie Foundation PayPal email
      amount: donationAmount.toFixed(2),
      currency_code: "USD",
      item_name: "Donation to Bertie Foundation",
      no_note: "0",
      return: window.location.href,
    });

    // Open PayPal in a new tab with the pre-filled amount
    window.open(`${baseUrl}?${params.toString()}`, "_blank");

    // Reset state
    setConfirmationDialogOpen(false);
    setSelectedTier(null);
  };

  const handleCustomDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customAmount);
    if (amount > 0) {
      openConfirmationDialog(amount);
      setCustomAmount("");
    }
  };

  return (
    <div className="relative">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/50 to-secondary-900/50 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1920')] opacity-10 bg-cover bg-center" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 lg:py-20 text-center">

        <div className="max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white mb-3 sm:mb-4 md:mb-6">
            Make a Difference Today
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300">
            Your donation helps us create lasting impact in our community.
            Every contribution, no matter the size, helps us build a better future together.
          </p>
        </div>

        {/* Donation Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-12">
          {DONATION_TIERS.map((tier, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedTier(index);
                openConfirmationDialog(tier.amount);
              }}
              className={`group relative p-2 sm:p-3 md:p-4 lg:p-5 rounded-xl bg-secondary-800/70 backdrop-blur
                         border-2 transition-all duration-300
                         ${selectedTier === index
                ? "border-primary-500 scale-105 shadow-lg shadow-primary-500/20"
                : "border-transparent hover:border-primary-400 hover:scale-[1.02] shadow-md hover:shadow-lg"}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${tier.color} opacity-0
                              group-hover:opacity-5 transition-opacity duration-300 rounded-xl`} />
              <div className="relative z-10">
                <div className="flex justify-center mb-2 sm:mb-3 md:mb-4 lg:mb-5">
                  <tier.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-[#FF4C4C]" />
                </div>
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-0.5 sm:mb-1 md:mb-2">
                  ${tier.amount}
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-semibold text-primary-400 mb-1 sm:mb-2 md:mb-3">
                  {tier.title}
                </div>
              </div>
            </button>
          ))}
        </div>

      {/* Custom Amount Form */}
      <div className="max-w-lg mx-auto space-y-4 sm:space-y-6">
        <div className="text-xs sm:text-sm md:text-base font-semibold text-white mb-2 sm:mb-3 md:mb-4">Or enter a custom amount</div>
        <form onSubmit={handleCustomDonation} className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6">
          <div className="flex-1 relative">
            <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            </div>
            <input
              type="number"
              min="1"
              step="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg bg-secondary-700/90 text-white placeholder:text-gray-400
                       border border-secondary-600 focus:border-primary-500
                       focus:ring-2 focus:ring-primary-500 focus:outline-none text-xs sm:text-sm shadow-inner"
            />
          </div>
          <Button type="submit" disabled={!customAmount || parseFloat(customAmount) <= 0}
            className="w-full sm:w-auto text-xs sm:text-sm py-2.5 sm:py-3 px-4 sm:px-6 min-w-[100px] sm:min-w-[120px]">
            Donate
          </Button>
        </form>
        
        {/* Campaign Information (if available) */}
        {selectedCampaignData && !campaignId && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-secondary-800/80 border border-secondary-700">
            <div className="text-[10px] sm:text-xs font-medium text-gray-400 mb-0.5 sm:mb-1">Your donation will support:</div>
            <div className="font-semibold text-white text-xs sm:text-sm md:text-base">{selectedCampaignData.title}</div>
            <div className="mt-1.5 sm:mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] sm:text-xs gap-1.5 sm:gap-0">
              <div>
                <span className="text-gray-400">Progress: </span>
                <span className="text-primary-400 font-medium">
                  {Math.round((selectedCampaignData.current_amount / selectedCampaignData.goal_amount) * 100)}%
                </span>
              </div>
              <Button 
                variant="text" 
                size="sm" 
                onClick={() => window.location.href = "/donate"}
                className="text-xs sm:text-sm -ml-2"
              >
                See all campaigns
              </Button>
            </div>
          </div>
        )}

        <p className="text-[10px] sm:text-xs text-gray-400 mt-1.5 sm:mt-2 md:mt-3 lg:mt-4">
          All donations are tax-deductible. You will receive a receipt via email.
        </p>
      </div>
      </div>

      {/* Donation Confirmation Dialog */}
      <DonationConfirmationDialog
        isOpen={confirmationDialogOpen}
        amount={donationAmount}
        onClose={() => setConfirmationDialogOpen(false)}
        onConfirm={handlePayPalRedirect}
        campaignId={campaignId || selectedCampaignData?.id}
      />
    </div>
  );
}
