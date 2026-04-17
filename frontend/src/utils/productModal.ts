import { create } from "zustand";

interface ProductModalStore {
  selectedProduct: any;
  setSelectedProduct: (product: any) => void;
}

export const useProductModalStore = create<ProductModalStore>((set) => ({
  selectedProduct: null,
  setSelectedProduct: (product) => set({ selectedProduct: product }),
}));
