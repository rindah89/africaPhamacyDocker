import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Step {
  step: number;
  name: string;
}

interface StepState {
  steps: Step[];
  activeStep: number;
}

const initialState: StepState = {
  steps: [
    {
      step: 1,
      name: "Personal Details",
    },
    {
      step: 2,
      name: "Shipping Address",
    },
    {
      step: 3,
      name: "Order Summary",
    },
    {
      step: 4,
      name: "Payment Method",
    },
  ],
  activeStep: 1,
};

const stepSlice = createSlice({
  name: "step",
  initialState,
  reducers: {
    setActiveStep: (state, action: PayloadAction<number>) => {
      state.activeStep = action.payload;
    },
  },
});

export const { setActiveStep } = stepSlice.actions;
export default stepSlice.reducer;
