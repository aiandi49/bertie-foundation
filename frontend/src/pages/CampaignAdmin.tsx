import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Button } from "../components/Button";
import { CampaignForm } from "../components/CampaignForm";
import { CampaignProgressTracker } from "../components/CampaignProgressTracker";
import { Campaign } from "../utils/campaignTypes";
import { useCampaignStore } from "../utils/campaignStore";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, RefreshCw, Eye, AlertCircle, CheckCircle } from "lucide-react";

export default function CampaignAdmin() {
  const { 
    campaigns, 
    fetchCampaigns, 
    createCampaign, 
    updateCampaign,
    resetCampaign,
    isLoading,
    error
  } = useCampaignStore();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: "success" | "error"} | null>(null);
  
  const navigate = useNavigate();
  
  // Load campaigns on mount
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);
  
  // Handle campaign creation
  const handleCreateCampaign = async (formData: any) => {
    try {
      const result = await createCampaign(formData);
      if (result) {
        setShowCreateForm(false);
        setNotification({
          message: "Campaign created successfully!",
          type: "success"
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      setNotification({
        message: "Failed to create campaign",
        type: "error"
      });
    }
  };
  
  // Handle campaign update
  const handleUpdateCampaign = async (formData: any) => {
    if (!editingCampaign) return;
    
    try {
      const result = await updateCampaign(editingCampaign.id, formData);
      if (result) {
        setEditingCampaign(null);
        setNotification({
          message: "Campaign updated successfully!",
          type: "success"
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
      setNotification({
        message: "Failed to update campaign",
        type: "error"
      });
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Calculate percentage complete
  const calculatePercentage = (current: number, goal: number) => {
    const percentage = Math.round((current / goal) * 100);
    return `${percentage}%`;
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Campaign Management</h1>
            <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">Create and manage fundraising campaigns</p>
          </div>
          <div className="mt-3 md:mt-0">
            <Button 
              onClick={() => {
                setEditingCampaign(null);
                setShowCreateForm(!showCreateForm);
                setPreviewCampaign(null);
              }}
            >
              {showCreateForm ? (
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Campaigns
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Campaign
                </span>
              )}
            </Button>
          </div>
        </div>
        
        {/* Notification */}
        {notification && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-center gap-2 sm:gap-3 ${notification.type === 'success' ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <p className={`text-sm sm:text-base ${notification.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
              {notification.message}
            </p>
          </div>
        )}
        
        {/* Campaign Form */}
        {(showCreateForm || editingCampaign) && (
          <div className="mb-6 sm:mb-8">
            <CampaignForm 
              campaign={editingCampaign || undefined}
              onSubmit={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingCampaign(null);
              }}
              isEditing={!!editingCampaign}
            />
          </div>
        )}
        
        {/* Campaign Preview */}
        {previewCampaign && !showCreateForm && !editingCampaign && (
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Campaign Preview</h2>
              <Button 
                variant="outline" 
                onClick={() => setPreviewCampaign(null)}
              >
                Close Preview
              </Button>
            </div>
            <CampaignProgressTracker campaignId={previewCampaign} />
          </div>
        )}
        
        {/* Campaigns List */}
        {!showCreateForm && !editingCampaign && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">All Campaigns</h2>
              <Button 
                variant="outline" 
                onClick={() => fetchCampaigns()}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-red-300">Error loading campaigns. Please try again.</p>
              </div>
            )}
            
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-secondary-800 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8 sm:py-12 bg-secondary-800 rounded-lg border border-secondary-700">
                <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">No campaigns found</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Campaign
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead>
                    <tr className="bg-secondary-800 border-b border-secondary-700">
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Campaign</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Progress</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Dates</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-secondary-900 divide-y divide-secondary-800">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-secondary-800/50 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{campaign.title}</div>
                          <div className="text-xs text-gray-400 mt-1 line-clamp-1">{campaign.description}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full max-w-xs">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-white">{formatCurrency(campaign.current_amount)}</span>
                                <span className="text-gray-400">{formatCurrency(campaign.goal_amount)}</span>
                              </div>
                              <div className="w-full h-2 bg-secondary-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary-500 transition-all duration-1000"
                                  style={{ width: calculatePercentage(campaign.current_amount, campaign.goal_amount) }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs text-white">Start: {formatDate(campaign.start_date)}</div>
                          <div className="text-xs text-gray-400 mt-1">End: {formatDate(campaign.end_date)}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${campaign.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                            {campaign.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-1.5 sm:gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setPreviewCampaign(campaign.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingCampaign(campaign);
                                setShowCreateForm(false);
                                setPreviewCampaign(null);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (window.confirm(`Reset the donation count for ${campaign.title}? This will set the current amount to $0 but keep the campaign history.`)) {
                                  try {
                                    await resetCampaign(campaign.id);
                                    setNotification({
                                      message: "Campaign reset successfully",
                                      type: "success"
                                    });
                                    setTimeout(() => setNotification(null), 5000);
                                  } catch (error) {
                                    console.error("Error resetting campaign:", error);
                                    setNotification({
                                      message: "Failed to reset campaign",
                                      type: "error"
                                    });
                                  }
                                }
                              }}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
