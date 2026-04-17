import { create } from "zustand";

interface Order {
  id: string;
  products: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  status: "pending" | "processing" | "shipped" | "delivered";
  date: string;
  total: number;
}

interface UserPreferences {
  fitnessGoals?: string[];
  dietaryRestrictions?: string[];
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  preferredCategories?: string[];
}

type ConsultationType = 'consultation' | 'health_check' | 'support' | 'transformation';

interface AIAgentState {
  isOpen: boolean;
  consultationType: ConsultationType | null;
  orders: Order[];
  preferences: UserPreferences;
  lastInteraction?: string;
  addOrder: (order: Omit<Order, "id" | "date">) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  updateLastInteraction: (date: string) => void;
  setOpen: (isOpen: boolean) => void;
  openConsultation: (type: ConsultationType) => void;
}

export const useAIAgentStore = create<AIAgentState>((set) => ({
  isOpen: false,
  consultationType: null,
  setOpen: (isOpen) => set({ isOpen }),
  openConsultation: (type) => set({ isOpen: true, consultationType: type }),
  orders: [],
  preferences: {},
  addOrder: (order) =>
    set((state) => ({
      orders: [
        ...state.orders,
        {
          ...order,
          id: Math.random().toString(36).substring(7),
          date: new Date().toISOString(),
        },
      ],
    })),
  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    })),
  updatePreferences: (prefs) =>
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    })),
  updateLastInteraction: (date) =>
    set(() => ({
      lastInteraction: date,
    })),
}));
