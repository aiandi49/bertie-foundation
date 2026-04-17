import React, { useState, useEffect } from "react";
import { Campaign, CampaignCreate } from "../utils/campaignTypes";
import { Button } from "./Button";
import { Trash2, Plus, X } from "lucide-react";

interface Props {
  campaign?: Campaign;
  onSubmit: (data: CampaignCreate | Partial<Campaign>) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export function CampaignForm({ 
  campaign, 
  onSubmit, 
  onCancel,
  isEditing = false 
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [impactMetrics, setImpactMetrics] = useState<Record<string, string>>({});
  const [impactKey, setImpactKey] = useState("");
  const [impactValue, setImpactValue] = useState("");
  
  // Initialize form with campaign data if editing
  useEffect(() => {
    if (campaign) {
      setTitle(campaign.title);
      setDescription(campaign.description);
      setGoalAmount(campaign.goal_amount.toString());
      setStartDate(campaign.start_date.split("T")[0]); // Format for date input
      
      if (campaign.end_date) {
        setEndDate(campaign.end_date.split("T")[0]); // Format for date input
      }
      
      if (campaign.impact_metrics) {
        setImpactMetrics(campaign.impact_metrics);
      }
    }
  }, [campaign]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      title,
      description,
      goal_amount: parseFloat(goalAmount),
      start_date: startDate ? new Date(startDate).toISOString() : undefined,
      end_date: endDate ? new Date(endDate).toISOString() : undefined,
      impact_metrics: impactMetrics
    };
    
    onSubmit(formData);
    
    // Reset form if not editing
    if (!isEditing) {
      setTitle("");
      setDescription("");
      setGoalAmount("");
      setStartDate("");
      setEndDate("");
      setImpactMetrics({});
    }
  };
  
  const addImpactMetric = () => {
    if (impactKey && impactValue) {
      setImpactMetrics(prev => ({
        ...prev,
        [impactKey]: impactValue
      }));
      setImpactKey("");
      setImpactValue("");
    }
  };
  
  const removeImpactMetric = (key: string) => {
    const updatedMetrics = { ...impactMetrics };
    delete updatedMetrics[key];
    setImpactMetrics(updatedMetrics);
  };
  
  const today = new Date().toISOString().split("T")[0];
  
  return (
    <form onSubmit={handleSubmit} className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
      <h2 className="text-2xl font-bold text-white mb-6">
        {isEditing ? "Edit Campaign" : "Create New Campaign"}
      </h2>
      
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Campaign Title <span className="text-primary-400">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Spring Garden Project"
            className="w-full px-4 py-2 rounded-lg bg-secondary-700 text-white
                     border border-secondary-600 focus:border-primary-500
                     focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description <span className="text-primary-400">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            placeholder="Describe the campaign's purpose and goals"
            className="w-full px-4 py-2 rounded-lg bg-secondary-700 text-white
                     border border-secondary-600 focus:border-primary-500
                     focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        
        {/* Goal Amount */}
        <div>
          <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-300 mb-2">
            Goal Amount ($) <span className="text-primary-400">*</span>
          </label>
          <input
            type="number"
            id="goalAmount"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            required
            min="1"
            step="1"
            placeholder="e.g., 5000"
            className="w-full px-4 py-2 rounded-lg bg-secondary-700 text-white
                     border border-secondary-600 focus:border-primary-500
                     focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        
        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={today}
              className="w-full px-4 py-2 rounded-lg bg-secondary-700 text-white
                       border border-secondary-600 focus:border-primary-500
                       focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || today}
              className="w-full px-4 py-2 rounded-lg bg-secondary-700 text-white
                       border border-secondary-600 focus:border-primary-500
                       focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
        </div>
        
        {/* Impact Metrics */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Impact Metrics
            <span className="text-gray-400 text-xs ml-2">(What will donations achieve?)</span>
          </label>
          
          {/* Current metrics */}
          {Object.keys(impactMetrics).length > 0 && (
            <div className="mb-4 space-y-2">
              {Object.entries(impactMetrics).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-secondary-700 border border-secondary-600">
                  <div>
                    <span className="text-sm font-medium text-gray-300">{key}: </span>
                    <span className="text-white">{value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImpactMetric(key)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Add new metric */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="impactKey" className="block text-xs font-medium text-gray-400 mb-1">
                Metric Name
              </label>
              <input
                type="text"
                id="impactKey"
                value={impactKey}
                onChange={(e) => setImpactKey(e.target.value)}
                placeholder="e.g., Meals Provided"
                className="w-full px-3 py-2 rounded-lg bg-secondary-700 text-white
                         border border-secondary-600 focus:border-primary-500
                         focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="impactValue" className="block text-xs font-medium text-gray-400 mb-1">
                Impact Value
              </label>
              <input
                type="text"
                id="impactValue"
                value={impactValue}
                onChange={(e) => setImpactValue(e.target.value)}
                placeholder="e.g., 500 meals per $1000"
                className="w-full px-3 py-2 rounded-lg bg-secondary-700 text-white
                         border border-secondary-600 focus:border-primary-500
                         focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <Button 
              type="button" 
              variant="secondary"
              disabled={!impactKey || !impactValue}
              onClick={addImpactMetric}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="mt-8 flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={!title || !description || !goalAmount}>
          {isEditing ? "Update Campaign" : "Create Campaign"}
        </Button>
      </div>
    </form>
  );
}
