"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, FileText, Clock, CheckCircle, Send } from "lucide-react";
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

interface Claim {
  id: string;
  claimNumber: string;
  orderNumber?: string;
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
}

export default function ClaimsTab({ claims }: ClaimsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  const handleStatusUpdate = async (claimId: string, newStatus: ClaimStatus) => {
    setIsLoading(true);
    try {
      const result = await updateClaimStatus(claimId, newStatus);
      if (result.success) {
        toast.success("Claim status updated successfully");
      } else {
        toast.error(result.error || "Failed to update claim status");
      }
    } catch (error) {
      toast.error("An error occurred while updating the claim status");
    } finally {
      setIsLoading(false);
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
                        <DropdownMenuContent align="end">
                          {claim.status === ClaimStatus.SUBMITTED && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(claim.id, ClaimStatus.PAID)}
                              disabled={isLoading}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          {claim.status === ClaimStatus.PAID && claim.paidDate && (
                            <DropdownMenuItem disabled>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Paid on {formatDate(claim.paidDate)}
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
    </Card>
  );
} 