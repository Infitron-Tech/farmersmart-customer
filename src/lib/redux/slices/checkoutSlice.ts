import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Address } from "@/types/ApiResponse";

export interface CheckoutState {
  selectedAddress: Address | null;
  orderNote: string;
  useWallet: boolean;
  rushDelivery: boolean;
  promoCode: string;
  deliveryMethod: string | null;
  deliveryFee: number;
}

const initialState: CheckoutState = {
  selectedAddress: null,
  orderNote: "",
  useWallet: false,
  rushDelivery: false,
  promoCode: "",
  deliveryMethod: null,
  deliveryFee: 0,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setSelectedAddress: (state, action: PayloadAction<Address | null>) => {
      state.selectedAddress = action.payload;
    },
    setOrderNote: (state, action: PayloadAction<string>) => {
      state.orderNote = action.payload;
    },
    setUseWallet: (state, action: PayloadAction<boolean>) => {
      state.useWallet = action.payload;
    },
    setRusDelivery: (state, action: PayloadAction<boolean>) => {
      state.rushDelivery = action.payload;
    },
    setPromoCode: (state, action: PayloadAction<string>) => {
      state.promoCode = action.payload;
    },
    setDeliveryMethod: (state, action: PayloadAction<string | null>) => {
      state.deliveryMethod = action.payload;
    },
    setDeliveryFee: (state, action: PayloadAction<number>) => {
      state.deliveryFee = action.payload;
    },
  },
});

export const {
  setSelectedAddress,
  setOrderNote,
  setUseWallet,
  setRusDelivery,
  setPromoCode,
  setDeliveryMethod,
  setDeliveryFee,
} = checkoutSlice.actions;
export default checkoutSlice.reducer;
