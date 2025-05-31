"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClaimStatus } from "@prisma/client";
import { CheckCircle, Send, Clock } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  action: string;
  onConfirm: () => void;
  isLoading?: boolean;
  variant?: "default" | "destructive";
  icon?: React.ReactNode;
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  action,
  onConfirm,
  isLoading = false,
  variant = "default",
  icon
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isLoading ? "Processing..." : action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Helper function to get confirmation details for claim status updates
export function getClaimStatusConfirmation(newStatus: ClaimStatus, claimNumber: string) {
  switch (newStatus) {
    case ClaimStatus.SUBMITTED:
      return {
        title: "Mark Claim as Submitted",
        description: `Are you sure you want to mark claim ${claimNumber} as submitted?\n\nThis action will:\n• Update the claim status to "SUBMITTED"\n• Indicate the claim has been processed and sent to the insurance provider\n• Set the processed date to today\n\nThis action can be reversed by marking as paid later.`,
        action: "Mark as Submitted",
        icon: <Send className="h-4 w-4" />,
        variant: "default" as const
      };
    case ClaimStatus.PAID:
      return {
        title: "Mark Claim as Paid",
        description: `Are you sure you want to mark claim ${claimNumber} as paid?\n\nThis action will:\n• Update the claim status to "PAID"\n• Set the paid date to today\n• Indicate the insurance provider has processed payment\n\nThis is typically the final status for a claim.`,
        action: "Mark as Paid",
        icon: <CheckCircle className="h-4 w-4" />,
        variant: "default" as const
      };
    default:
      return {
        title: "Update Claim Status",
        description: `Are you sure you want to update the status of claim ${claimNumber}?\n\nThis will change the claim's current status and may affect reporting.`,
        action: "Update Status",
        icon: <Clock className="h-4 w-4" />,
        variant: "default" as const
      };
  }
} 