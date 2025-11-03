import { create } from "zustand";

interface CheckoutData {
  address?: string;
  phone?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  // optional storeId provided when opening the modal so the modal can fetch store settings
  storeId?: string;
}

interface CheckoutModalStore {
  isOpen: boolean;
  data?: CheckoutData;
  onOpen: (data?: CheckoutData) => void;
  onClose: () => void;
}

const useCheckoutModal = create<CheckoutModalStore>((set) => ({
  isOpen: false,
  data: undefined,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false }),
}));

export default useCheckoutModal;
