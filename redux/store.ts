// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import pointOfSale from "./slices/pointOfSale";
import cartSlice from "./slices/cartSlice";
import historySlice from "./slices/historySlice";
import stepSlice from "./slices/stepSlice";
import checkoutSlice from "./slices/checkoutSlice";

const store = configureStore({
  reducer: {
    pos: pointOfSale,
    cart: cartSlice,
    history: historySlice,
    step: stepSlice,
    checkout: checkoutSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
