// src/store/productSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

interface HistoryItem {
  id: string;
  name: string;
  slug: string;
  productPrice: number;
  productThumbnail: string;
  productDetails: string;
  stockQty: number;
}

interface HistoryState {
  historyItems: HistoryItem[];
}

// Safely retrieve cart items from localStorage
const getInitialHistoryItems = (): HistoryItem[] => {
  try {
    const storedHistory = localStorage.getItem("history");
    if (storedHistory) {
      return JSON.parse(storedHistory);
    }
  } catch (error) {
    console.error("Failed to parse history items from localStorage", error);
  }
  return [];
};

const initialState: HistoryState = {
  historyItems: getInitialHistoryItems(),
};
const saveItemsToLocalStorage = (items: HistoryItem[]) => {
  localStorage.setItem("history", JSON.stringify(items));
};
const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    addProductToHistory: (state, action: PayloadAction<HistoryItem>) => {
      const existingItem = state.historyItems.find(
        (product) => product.id === action.payload.id
      );
      if (!existingItem) {
        state.historyItems.push(action.payload);
        saveItemsToLocalStorage(state.historyItems);
      }
    },
    removeProductFromHistory: (state, action: PayloadAction<string>) => {
      state.historyItems = state.historyItems.filter(
        (item) => item.id !== action.payload
      );
      saveItemsToLocalStorage(state.historyItems);
    },
  },
});

export const { addProductToHistory, removeProductFromHistory } =
  historySlice.actions;
export default historySlice.reducer;
