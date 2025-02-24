import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { setActiveStep } from "@/redux/slices/stepSlice";
import React from "react";

export default function NextButton() {
  const activeStep = useAppSelector((state) => state.step.activeStep);
  const steps = useAppSelector((state) => state.step.steps);
  return (
    <Button>
      {activeStep === steps.length ? "Proceed to Payment" : "Next"}
    </Button>
  );
}
