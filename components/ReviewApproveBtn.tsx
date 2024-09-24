"use client";
import { cn } from "@/lib/utils";
import { Loader2, Pencil } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { updateReviewById } from "@/actions/reviews";
import toast from "react-hot-toast";

export default function ReviewApproveBtn({
  id,
  status,
}: {
  id: string;
  status: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState(status);
  async function handleClick() {
    setLoading(true);
    // console.log(id);
    await updateReviewById(id, !status);
    toast.success("Review Updated Successfully");
    setLoading(false);
    setUpdatedStatus(!status);
    try {
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }
  return (
    <div className="mt-2">
      {loading ? (
        <div className="">
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleClick}
          variant={updatedStatus ? "default" : "destructive"}
        >
          <Pencil className="w-4 h-4 mr-2 flex-shrink-0" />
          {updatedStatus ? "Approved" : "Approve"}
        </Button>
      )}
    </div>
  );
}
