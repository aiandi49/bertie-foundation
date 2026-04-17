import React from "react";
import { Button } from "./Button";
import { X, DollarSign } from "lucide-react";
import { useCampaignStore } from "../utils/campaignStore";

interface Props {
  isOpen: boolean;
  amount: number;
  onClose: () => void;
  onConfirm: () => void;
  campaignId?: string;
}

export function DonationConfirmationDialog({ isOpen, amount, onClose, onConfirm, campaignId }: Props) {
  const { addDonation } = useCampaignStore();
  
  if (!isOpen) return null;
  
  const handleConfirm = async () => {
    // Add donation to campaign if campaign ID is provided
    if (campaignId) {
      try {
        await addDonation(campaignId, {
          amount: amount,
          donor_name: "Anonymous",
        });
      } catch (error) {
        console.error("Error adding donation to campaign:", error);
        // Continue with payment even if campaign tracking fails
      }
    }
    
    // Proceed with payment
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Dialog Content */}
      <div className="relative z-10 bg-secondary-800 p-4 sm:p-5 md:p-6 rounded-lg shadow-2xl w-full max-w-md m-4 border border-secondary-700 transform transition-all">
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex justify-center mb-4 sm:mb-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary-500/20 rounded-full flex items-center justify-center">
            <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-400" />
          </div>
        </div>
        
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">
          Confirm Your Donation
        </h3>
        
        <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-5 md:mb-6 text-center">
          You're about to donate <span className="font-bold text-primary-400">${amount.toFixed(2)}</span> to the Bertie Foundation. 
          Your generosity helps us create lasting impact in our community.
        </p>
        
        <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-5 md:mb-6 text-center">
          After confirmation, you'll be directed to PayPal to complete your donation.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500"
          >
            Confirm Donation
          </Button>
        </div>
      </div>
    </div>
  );
}
