import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSession } from "next-auth/react";

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
}

export interface CheckoutState {
  personalDetails: PersonalDetails;
  paymentMethod: PaymentMethod | null;
}

// Load state from localStorage
const loadState = (): CheckoutState | undefined => {
  try {
    const checkoutInfo = localStorage.getItem("checkoutState");
    if (checkoutInfo === null) {
      return undefined;
    }
    return JSON.parse(checkoutInfo);
  } catch (err) {
    console.error("Could not load state", err);
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state: CheckoutState) => {
  try {
    const checkoutInfo = JSON.stringify(state);
    localStorage.setItem("checkoutState", checkoutInfo);
  } catch (err) {
    console.error("Could not save state", err);
  }
};

const initialState: CheckoutState = loadState() || {
  personalDetails: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
  paymentMethod: null,
};

const checkoutInfoState = createSlice({
  name: "checkoutInfo",
  initialState,
  reducers: {
    setPersonalDetails: (state, action: PayloadAction<PersonalDetails>) => {
      state.personalDetails = action.payload;
      saveState(state);
    },
    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.paymentMethod = action.payload;
      saveState(state);
    },
    clearPaymentMethod: (state) => {
      state.paymentMethod = null;
      saveState(state);
    },
  },
});

export const { setPersonalDetails, setPaymentMethod, clearPaymentMethod } = checkoutInfoState.actions;
export default checkoutInfoState.reducer;
