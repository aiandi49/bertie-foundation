import { create } from "zustand";
import { apiClient } from "app";
import { Campaign, CampaignCreate, DonationUpdate } from "./campaignTypes";

interface CampaignState {
  // Campaign data
  campaigns: Campaign[];
  activeCampaigns: Campaign[];
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  fetchCampaigns: () => Promise<void>;
  fetchActiveCampaigns: () => Promise<void>;
  getCampaign: (campaignId: string) => Promise<Campaign | null>;
  createCampaign: (campaign: CampaignCreate) => Promise<Campaign | null>;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => Promise<Campaign | null>;
  addDonation: (campaignId: string, donation: DonationUpdate) => Promise<Campaign | null>;
  resetCampaign: (campaignId: string) => Promise<Campaign | null>;
};

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  activeCampaigns: [],
  isLoading: false,
  error: null,
  
  fetchCampaigns: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.list_campaigns();
      const campaigns = await response.json();
      set({ campaigns, isLoading: false });
      return campaigns;
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      console.error("Error fetching campaigns:", error);
    }
  },
  
  fetchActiveCampaigns: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.list_campaigns({ active_only: true });
      const activeCampaigns = await response.json();
      set({ activeCampaigns, isLoading: false });
      return activeCampaigns;
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      console.error("Error fetching active campaigns:", error);
    }
  },
  
  getCampaign: async (campaignId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get_campaign({ campaign_id: campaignId });
      const campaign = await response.json();
      set({ isLoading: false });
      return campaign;
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      console.error(`Error fetching campaign ${campaignId}:`, error);
      return null;
    }
  },
  
  createCampaign: async (campaign: CampaignCreate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.create_campaign(campaign);
      const newCampaign = await response.json();
      set(state => ({
        campaigns: [...state.campaigns, newCampaign],
        activeCampaigns: newCampaign.is_active 
          ? [...state.activeCampaigns, newCampaign] 
          : state.activeCampaigns,
        isLoading: false
      }));
      return newCampaign;
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      console.error("Error creating campaign:", error);
      return null;
    }
  },
  
  updateCampaign: async (campaignId: string, updates: Partial<Campaign>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.update_campaign({ campaign_id: campaignId }, updates);
      const updatedCampaign = await response.json();
      
      set(state => ({
        campaigns: state.campaigns.map(c => 
          c.id === campaignId ? updatedCampaign : c
        ),
        activeCampaigns: state.activeCampaigns.map(c => 
          c.id === campaignId ? updatedCampaign : c
        ).filter(c => c.is_active),
        isLoading: false
      }));
      
      return updatedCampaign;
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      console.error(`Error updating campaign ${campaignId}:`, error);
      return null;
    }
  },
  
  addDonation: async (campaignId: string, donation: DonationUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.add_donation_to_campaign(
        { campaign_id: campaignId },
        donation
      );
      const updatedCampaign = await response.json();
      
      set(state => ({
        campaigns: state.campaigns.map(c => 
          c.id === campaignId ? updatedCampaign : c
        ),
        activeCampaigns: state.activeCampaigns.map(c => 
          c.id === campaignId ? updatedCampaign : c
        ),
        isLoading: false
      }));
      
      return updatedCampaign;
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      console.error(`Error adding donation to campaign ${campaignId}:`, error);
      return null;
    }
  },
  
  resetCampaign: async (campaignId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.reset_campaign({ campaign_id: campaignId });
      const resetCampaign = await response.json();
      
      set(state => ({
        campaigns: state.campaigns.map(c => 
          c.id === campaignId ? resetCampaign : c
        ),
        activeCampaigns: state.activeCampaigns.map(c => 
          c.id === campaignId ? resetCampaign : c
        ),
        isLoading: false
      }));
      
      return resetCampaign;
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      console.error(`Error resetting campaign ${campaignId}:`, error);
      return null;
    }
  }
}));
