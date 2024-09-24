// src/store/productSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

export interface OrderLineItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  productThumbnail: string;
  stock: number;
}

interface OrderLineItems {
  products: OrderLineItem[];
}

const getInitialOrderLineItems = (): OrderLineItem[] => {
  try {
    const storedItems = localStorage.getItem("posItems");
    if (storedItems) {
      return JSON.parse(storedItems);
    }
  } catch (error) {
    console.error("Failed to parse cart items from localStorage", error);
  }
  return [];
};
const initialState: OrderLineItems = {
  products: getInitialOrderLineItems(),
};
const saveItemsToLocalStorage = (items: OrderLineItem[]) => {
  localStorage.setItem("posItems", JSON.stringify(items));
};
const pointOfSaleSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addProductToOrderLine: (state, action: PayloadAction<OrderLineItem>) => {
      state.products.push(action.payload);
      saveItemsToLocalStorage(state.products);
      toast.success("Item added Successfully");
    },
    removeProductFromOrderLine: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(
        (product) => product.id !== action.payload
      );
      saveItemsToLocalStorage(state.products);
      toast.success("Item Removed Successfully");
    },
    removeAllProductsFromOrderLine: (state) => {
      state.products = [];
      saveItemsToLocalStorage(state.products);
      // toast.success("All items cleared successfully");
    },
    incrementQty: (state, action: PayloadAction<string>) => {
      const item = state.products.find(
        (product) => product.id === action.payload
      );
      if (item && item.qty < item.stock) {
        item.qty += 1;
        saveItemsToLocalStorage(state.products);
      }
    },
    decrementQty: (state, action: PayloadAction<string>) => {
      const item = state.products.find(
        (product) => product.id === action.payload
      );
      if (item && item.qty > 1) {
        item.qty -= 1;
        saveItemsToLocalStorage(state.products);
      } else {
        state.products = state.products.filter(
          (product) => product.id !== action.payload
        );
        saveItemsToLocalStorage(state.products);
        toast.success("Item Removed Successfully");
      }
    },
  },
});

export const {
  addProductToOrderLine,
  removeProductFromOrderLine,
  removeAllProductsFromOrderLine,
  incrementQty,
  decrementQty,
} = pointOfSaleSlice.actions;
export default pointOfSaleSlice.reducer;
