"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, DollarSign, Calendar, Clock, CheckCircle } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { updateBillPayment, updateBillStatus } from "@/actions/insurance";
import { toast } from "sonner";
import { BillStatus } from "@prisma/client";

interface Bill {
  id: string;
  billNumber: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  billDate: Date;
  dueDate: Date;
  paidDate?: Date;
  status: BillStatus;
  notes?: string;
  provider: {
    name: string;
    code: string;
  };
  claim: {
    claimNumber: string;
    customerInsurance: {
      customerName: string;
      policyNumber: string;
    };
  };
}

interface BillsTabProps {
  bills: Bill[];
}

export default function BillsTab({ bills }: BillsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.claim.customerInsurance.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.provider.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter;
    
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

  const getStatusIcon = (status: BillStatus) => {
    switch (status) {
      case BillStatus.DRAFT:
        return <Clock className="h-4 w-4 text-gray-500" />;
      case BillStatus.SENT:
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case BillStatus.PAID:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case BillStatus.OVERDUE:
        return <Clock className="h-4 w-4 text-red-500" />;
      case BillStatus.CANCELLED:
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: BillStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case BillStatus.PAID:
        return "default";
      case BillStatus.OVERDUE:
        return "destructive";
      case BillStatus.SENT:
        return "secondary";
      case BillStatus.CANCELLED:
        return "outline";
      default:
        return "secondary";
    }
  };

  const isOverdue = (bill: Bill) => {
    const today = new Date();
    const dueDate = new Date(bill.dueDate);
    return dueDate < today && bill.status !== BillStatus.PAID && bill.status !== BillStatus.CANCELLED;
  };

  const handlePaymentSubmit = async () => {
    if (!selectedBill || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedBill.balanceAmount) {
      toast.error("Invalid payment amount");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateBillPayment(selectedBill.id, amount);
      if (result.success) {
        toast.success("Payment recorded successfully");
        setPaymentDialogOpen(false);
        setPaymentAmount("");
        setSelectedBill(null);
      } else {
        toast.error(result.error || "Failed to record payment");
      }
    } catch (error) {
      toast.error("An error occurred while recording the payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (billId: string, newStatus: BillStatus) => {
    setIsLoading(true);
    try {
      const result = await updateBillStatus(billId, newStatus);
      if (result.success) {
        toast.success("Bill status updated successfully");
      } else {
        toast.error(result.error || "Failed to update bill status");
      }
    } catch (error) {
      toast.error("An error occurred while updating the bill status");
    } finally {
      setIsLoading(false);
    }
  };

  const openPaymentDialog = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentAmount(bill.balanceAmount.toString());
    setPaymentDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Insurance Bills</CardTitle>
              <CardDescription>
                Manage bills sent to insurance providers and track payments
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bills..."
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
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No bills found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBills.map((bill) => (
                    <TableRow key={bill.id} className={isOverdue(bill) ? "bg-red-50" : ""}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{bill.billNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            Claim: {bill.claim.claimNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{bill.claim.customerInsurance.customerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {bill.claim.customerInsurance.policyNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{bill.provider.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {bill.provider.code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(bill.totalAmount)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600">
                          {formatCurrency(bill.paidAmount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${bill.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(bill.balanceAmount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className={`text-sm ${isOverdue(bill) ? 'text-red-600 font-medium' : ''}`}>
                            {formatDate(bill.dueDate)}
                          </div>
                          {isOverdue(bill) && (
                            <div className="text-xs text-red-500">Overdue</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(bill.status)}
                          <Badge variant={getStatusVariant(bill.status)}>
                            {bill.status}
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
                            {bill.balanceAmount > 0 && bill.status !== BillStatus.CANCELLED && (
                              <DropdownMenuItem 
                                onClick={() => openPaymentDialog(bill)}
                                disabled={isLoading}
                              >
                                <DollarSign className="mr-2 h-4 w-4" />
                                Record Payment
                              </DropdownMenuItem>
                            )}
                            {bill.status === BillStatus.DRAFT && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(bill.id, BillStatus.SENT)}
                                disabled={isLoading}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                Mark as Sent
                              </DropdownMenuItem>
                            )}
                            {bill.status !== BillStatus.CANCELLED && bill.status !== BillStatus.PAID && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(bill.id, BillStatus.CANCELLED)}
                                disabled={isLoading}
                                className="text-red-600"
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                Cancel Bill
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

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for bill {selectedBill?.billNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Amount:</span>
                  <div className="font-medium">{formatCurrency(selectedBill.totalAmount)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Already Paid:</span>
                  <div className="font-medium">{formatCurrency(selectedBill.paidAmount)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Balance Due:</span>
                  <div className="font-medium text-red-600">{formatCurrency(selectedBill.balanceAmount)}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Payment Amount ($)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  min="0"
                  max={selectedBill.balanceAmount}
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentSubmit} disabled={isLoading || !paymentAmount}>
              {isLoading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 