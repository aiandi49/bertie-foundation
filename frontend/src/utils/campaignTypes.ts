export interface Donation {
  amount: number;
  donor_name: string;
  timestamp: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  recent_donations: Donation[];
  impact_metrics: Record<string, string>;
}

export interface CampaignCreate {
  title: string;
  description: string;
  goal_amount: number;
  start_date?: string;
  end_date?: string;
  impact_metrics?: Record<string, string>;
}

export interface CampaignUpdate {
  title?: string;
  description?: string;
  goal_amount?: number;
  current_amount?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  impact_metrics?: Record<string, string>;
}

export interface DonationUpdate {
  amount: number;
  donor_name?: string;
  donor_email?: string;
  timestamp?: string;
}
