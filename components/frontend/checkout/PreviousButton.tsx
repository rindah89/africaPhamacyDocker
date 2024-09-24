"use client";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { setActiveStep } from "@/redux/slices/stepSlice";
import React from "react";

export default function PreviousButton() {
  const activeStep = useAppSelector((state) => state.step.activeStep);
  const dispatch = useAppDispatch();
  function handleClick() {
    if (activeStep > 1) {
      dispatch(setActiveStep(activeStep - 1));
    }
  }
  return (
    <Button
      onClick={handleClick}
      disabled={activeStep === 1}
      type="button"
      variant={"outline"}
    >
      Previous
    </Button>
  );
}
