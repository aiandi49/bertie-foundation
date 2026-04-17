// Program Types
export interface Program {
  id: string;
  title: string;
  description: string;
  image: string;
  impact: string;
  category: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  skills: string[];
  commitment: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string;
}

export interface DonationAmount {
  id: string;
  amount: number;
  label: string;
  description: string;
}

// Chat Types

export interface ChatData {
  response: string;
  session_id: string;
}

export type ConsultationType = 'consultation' | 'health_check' | 'support' | 'transformation';

export interface ChatEvent {
  name: string;
  data: any;
}

// Extend window object to include PlayAI
declare global {
  interface Window {
    PlayAI?: {
      on: (event: string, callback: (event: ChatEvent) => void) => void;
      off: (event: string) => void;
      close: () => void;
    };
  }
}

// Product Types
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

// Cart Types
export interface CartItem extends Product {
  quantity: number;
}
