"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, FileText, Clock, CheckCircle, Send, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateClaimStatus } from "@/actions/insurance";
import { toast } from "sonner";
import { ClaimStatus } from "@prisma/client";
import ConfirmationDialog, { getClaimStatusConfirmation } from "./ConfirmationDialog";
import { useRouter } from "next/navigation";

interface Claim {
  id: string;
  claimNumber: string;
  orderNumber?: string;
  orderId?: string; // Add orderId to navigate directly
  customerName: string;
  customerPhone?: string;
  policyNumber: string;
  totalAmount: number;
  insurancePercentage: number;
  insuranceAmount: number;
  customerAmount: number;
  claimDate: Date;
  processedDate?: Date;
  paidDate?: Date;
  status: ClaimStatus;
  notes?: string;
  provider: {
    name: string;
    code: string;
  };
  claimItems: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  monthlyReport?: {
    reportNumber: string;
    month: number;
    year: number;
  } | null;
}

interface ClaimsTabProps {
  claims: Claim[];
  onDataChange?: () => void; // Optional callback to refresh data
}

export default function ClaimsTab({ claims, onDataChange }: ClaimsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    claimId: string;
    newStatus: ClaimStatus;
    claimNumber: string;
  } | null>(null);
  const router = useRouter();

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = 
      claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.provider.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getStatusIcon = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.PENDING:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case ClaimStatus.SUBMITTED:
        return <Send className="h-4 w-4 text-blue-500" />;
      case ClaimStatus.PAID:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: ClaimStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case ClaimStatus.PAID:
        return "default";
      case ClaimStatus.SUBMITTED:
        return "secondary";
      case ClaimStatus.PENDING:
        return "outline";
      default:
        return "outline";
    }
  };

  const handleStatusUpdate = (claimId: string, newStatus: ClaimStatus, claimNumber: string) => {
    setPendingAction({ claimId, newStatus, claimNumber });
    setConfirmationOpen(true);
  };

  const executeStatusUpdate = async () => {
    if (!pendingAction) return;
    
    setIsLoading(true);
    try {
      console.log('Updating claim status:', {
        claimId: pendingAction.claimId,
        newStatus: pendingAction.newStatus,
        claimNumber: pendingAction.claimNumber
      });
      
      const result = await updateClaimStatus(pendingAction.claimId, pendingAction.newStatus);
      
      console.log('Update result:', result);
      
      if (result.success) {
        toast.success(`Claim ${pendingAction.claimNumber} marked as ${pendingAction.newStatus.toLowerCase()}`);
        // The server action already calls revalidatePath, so data will refresh automatically
        if (onDataChange) {
          onDataChange();
        }
        // No need for manual reload as revalidatePath handles the refresh
      } else {
        console.error('Update failed:', result.error);
        toast.error(result.error || "Failed to update claim status");
      }
    } catch (error) {
      console.error('Error updating claim status:', error);
      toast.error("An error occurred while updating the claim status. Please try again.");
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  const handleViewOrder = (claim: Claim) => {
    console.log('handleViewOrder called with claim:', {
      id: claim.id,
      orderId: claim.orderId,
      orderNumber: claim.orderNumber,
      claimNumber: claim.claimNumber
    });
    
    // Navigate directly to the orders page
    if (claim.orderId) {
      console.log(`Navigating to: /dashboard/orders/${claim.orderId}`);
      router.push(`/dashboard/orders/${claim.orderId}`);
    } else if (claim.orderNumber) {
      console.log(`Navigating to orders with search: ${claim.orderNumber}`);
      // If we only have orderNumber, we'll need to search for it
      // For now, navigate to the orders list page
      router.push(`/dashboard/orders?search=${claim.orderNumber}`);
    } else {
      console.warn('No orderId or orderNumber found for claim:', claim.claimNumber);
      toast.error('Unable to find associated order for this claim');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Insurance Claims</CardTitle>
            <CardDescription>
              Track customer insurance claims for monthly reporting
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search claims..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Insurance %</TableHead>
                <TableHead>Insurance Amount</TableHead>
                <TableHead>Customer Paid</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-3">
                      <FileText className="h-12 w-12 text-muted-foreground/50" />
                      <div>
                        <h3 className="text-lg font-medium">No Insurance Claims</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Claims will appear here when customers use insurance for purchases
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          At POS: Select insurance provider → Enter percentage → Process payment
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{claim.claimNumber}</div>
                        {claim.orderNumber && (
                          <div className="text-sm text-muted-foreground">
                            Order: {claim.orderNumber}
                          </div>
                        )}
                        {claim.monthlyReport && (
                          <div className="text-xs text-blue-600">
                            Report: {claim.monthlyReport.reportNumber}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{claim.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {claim.policyNumber}
                        </div>
                        {claim.customerPhone && (
                          <div className="text-xs text-muted-foreground">
                            {claim.customerPhone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{claim.provider.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {claim.provider.code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(claim.totalAmount)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{claim.insurancePercentage}%</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-blue-600">
                        {formatCurrency(claim.insuranceAmount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        {formatCurrency(claim.customerAmount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{formatDate(claim.claimDate)}</div>
                        {claim.processedDate && (
                          <div className="text-xs text-muted-foreground">
                            Processed: {formatDate(claim.processedDate)}
                          </div>
                        )}
                        {claim.paidDate && (
                          <div className="text-xs text-green-600">
                            Paid: {formatDate(claim.paidDate)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(claim.status)}
                        <Badge variant={getStatusVariant(claim.status)}>
                          {claim.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {/* View Order Action - Always available if order exists */}
                          {claim.orderNumber && (
                            <DropdownMenuItem 
                              onClick={() => handleViewOrder(claim)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Order
                            </DropdownMenuItem>
                          )}
                          
                          {/* Mark as Submitted - Available for PENDING claims */}
                          {claim.status === ClaimStatus.PENDING && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(claim.id, ClaimStatus.SUBMITTED, claim.claimNumber)}
                              disabled={isLoading}
                              className="focus:bg-blue-50 focus:text-blue-900"
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Mark as Submitted
                            </DropdownMenuItem>
                          )}
                          
                          {/* Mark as Paid - Available for SUBMITTED claims */}
                          {claim.status === ClaimStatus.SUBMITTED && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(claim.id, ClaimStatus.PAID, claim.claimNumber)}
                              disabled={isLoading}
                              className="focus:bg-green-50 focus:text-green-900"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          
                          {/* Status Info for PAID claims */}
                          {claim.status === ClaimStatus.PAID && claim.paidDate && (
                            <DropdownMenuItem disabled>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Paid on {formatDate(claim.paidDate)}
                            </DropdownMenuItem>
                          )}

                          
                          {/* If no order exists, show info */}
                          {!claim.orderNumber && (
                            <DropdownMenuItem disabled>
                              <Eye className="mr-2 h-4 w-4 opacity-50" />
                              No order linked
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      {/* Confirmation Dialog */}
      {pendingAction && (
        <ConfirmationDialog
          open={confirmationOpen}
          onOpenChange={setConfirmationOpen}
          {...getClaimStatusConfirmation(pendingAction.newStatus, pendingAction.claimNumber)}
          onConfirm={executeStatusUpdate}
          isLoading={isLoading}
        />
      )}
    </Card>
  );
} 