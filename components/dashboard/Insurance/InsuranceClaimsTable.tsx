"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MoreHorizontal, Check, X, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { InsuranceOrderStatus } from '@prisma/client';
import { updateInsuranceOrderStatus } from '@/actions/insurance';
import toast from 'react-hot-toast';

interface InsuranceOrder {
  id: string;
  orderId: string;
  insuranceProviderId: string;
  claimNumber?: string | null;
  totalAmount: number;
  coveredAmount: number;
  patientContribution: number;
  status: InsuranceOrderStatus;
  notes?: string | null;
  processedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    lineOrderItems: any[];
  };
  insuranceProvider: {
    id: string;
    name: string;
    companyName: string;
  };
}

interface InsuranceClaimsTableProps {
  initialClaims: InsuranceOrder[];
  providers: any[];
}

export default function InsuranceClaimsTable({ initialClaims, providers }: InsuranceClaimsTableProps) {
  const [claims, setClaims] = useState<InsuranceOrder[]>(initialClaims);
  const [loading, setLoading] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<InsuranceOrder | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [statusToUpdate, setStatusToUpdate] = useState<InsuranceOrderStatus | null>(null);

  const getStatusBadge = (status: InsuranceOrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
      case 'PROCESSING':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Processing</Badge>;
      case 'PAID':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Paid</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount / 100); // Assuming amounts are stored in cents
  };

  const handleStatusChange = async () => {
    if (!selectedClaim || !statusToUpdate) return;

    setLoading(true);
    try {
      await updateInsuranceOrderStatus(selectedClaim.id, statusToUpdate, notes);
      
      // Update the local state with the new status
      setClaims(claims.map(claim => 
        claim.id === selectedClaim.id 
          ? { 
              ...claim, 
              status: statusToUpdate, 
              notes: notes || claim.notes,
              processedAt: (statusToUpdate === 'PAID' || statusToUpdate === 'REJECTED') ? new Date() : claim.processedAt
            } 
          : claim
      ));
      
      toast.success(`Status updated to ${statusToUpdate}`);
      setStatusDialogOpen(false);
      setSelectedClaim(null);
      setNotes('');
      setStatusToUpdate(null);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const openStatusDialog = (claim: InsuranceOrder, status: InsuranceOrderStatus) => {
    setSelectedClaim(claim);
    setStatusToUpdate(status);
    setNotes(claim.notes || '');
    setStatusDialogOpen(true);
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Claim #</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Covered</TableHead>
                <TableHead>Patient Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-4">
                    No insurance claims found.
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.order.orderNumber}</TableCell>
                    <TableCell>{claim.order.customerName}</TableCell>
                    <TableCell>{claim.insuranceProvider.name}</TableCell>
                    <TableCell>{claim.claimNumber || '—'}</TableCell>
                    <TableCell>{formatCurrency(claim.totalAmount)}</TableCell>
                    <TableCell>{formatCurrency(claim.coveredAmount)}</TableCell>
                    <TableCell>{formatCurrency(claim.patientContribution)}</TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(claim.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openStatusDialog(claim, 'PROCESSING')}>
                            <Clock className="mr-2 h-4 w-4" />
                            Mark as Processing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openStatusDialog(claim, 'PAID')}>
                            <Check className="mr-2 h-4 w-4" />
                            Mark as Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openStatusDialog(claim, 'REJECTED')}>
                            <X className="mr-2 h-4 w-4" />
                            Mark as Rejected
                          </DropdownMenuItem>
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

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Update Insurance Claim Status
            </DialogTitle>
            <DialogDescription>
              Change the status of this insurance claim to {statusToUpdate?.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Number</p>
                  <p className="font-medium">{selectedClaim.order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedClaim.order.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Provider</p>
                  <p className="font-medium">{selectedClaim.insuranceProvider.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(selectedClaim.coveredAmount)}</p>
                </div>
              </div>
              
              <div>
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this status change..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 