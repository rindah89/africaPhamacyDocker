"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  User, 
  Calendar, 
  Package, 
  DollarSign, 
  Clock,
  MapPin,
  Phone,
  FileText,
  ExternalLink
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import OrderInvoice from "@/components/frontend/orders/OrderInvoice";
import { ILineOrder } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface OrderItem {
  id: string;
  productName: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  orderItems: OrderItem[];
  notes?: string;
}

interface ClaimCustomer {
  name: string;
  phone?: string;
  policyNumber: string;
}

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber?: string;
  claimNumber?: string;
  claimCustomer?: ClaimCustomer;
}

export default function OrderDetailsDialog({ 
  open, 
  onOpenChange, 
  orderNumber,
  claimNumber,
  claimCustomer 
}: OrderDetailsDialogProps) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [lineOrder, setLineOrder] = useState<ILineOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("invoice");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-CM', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const fetchOrderDetails = async () => {
    if (!orderNumber) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/orders/${orderNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      setOrderDetails(data);
      
      // Convert to ILineOrder format for OrderInvoice component
      // and override customer information with claim data
      const convertedOrder: ILineOrder = {
        id: data.id,
        orderNumber: data.orderNumber,
        firstName: claimCustomer?.name || data.customer?.name || "",
        lastName: "", // We'll use the full name in firstName
        phone: claimCustomer?.phone || data.customer?.phone || "",
        email: data.customer?.email || "",
        address: data.customer?.address || "",
        city: "",
        district: "",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt || data.createdAt,
        status: data.status,
        paymentMethod: data.paymentMethod || "CASH",
        amountPaid: data.total,
        customerPaidAmount: data.customerPaidAmount,
        insuranceAmount: data.insuranceAmount,
        insurancePercentage: data.insurancePercentage,
        insuranceProviderName: data.insuranceProviderName,
        insurancePolicyNumber: claimCustomer?.policyNumber || data.insurancePolicyNumber,
        lineOrderItems: data.orderItems?.map((item: any) => ({
          id: item.id,
          name: item.productName,
          price: item.unitPrice,
          qty: item.quantity,
          productId: item.productId || "",
          productThumbnail: item.productThumbnail || "/placeholder-product.jpg",
        })) || []
      };
      
      setLineOrder(convertedOrder);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && orderNumber) {
      fetchOrderDetails();
    }
  }, [open, orderNumber, fetchOrderDetails]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Insurance Order Details
              </DialogTitle>
              <DialogDescription>
                {claimNumber && `Order associated with claim ${claimNumber}`}
                {orderNumber && ` - Order #${orderNumber}`}
                {claimCustomer && ` - Customer: ${claimCustomer.name}`}
              </DialogDescription>
            </div>
            {orderDetails?.id && (
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link 
                    href={`/dashboard/orders/${orderDetails.id}`}
                    className="flex items-center gap-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Full Order
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">⚠️ {error}</div>
            <p className="text-sm text-muted-foreground">
              Unable to load order details for order #{orderNumber}
            </p>
          </div>
        ) : lineOrder && orderDetails ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="invoice" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Invoice & Print
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Details
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="invoice" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Order Invoice
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Insurance Claim
                      </Badge>
                      {claimCustomer?.policyNumber && (
                        <Badge variant="secondary">
                          Policy: {claimCustomer.policyNumber}
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Customer: {claimCustomer?.name || lineOrder.firstName}
                    {claimCustomer?.phone && ` • Phone: ${claimCustomer.phone}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderInvoice 
                    order={lineOrder} 
                    readOnly={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="details" className="mt-6">
              <div className="space-y-6">
                {/* Customer Information from Claim */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information (From Insurance Claim)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-semibold">{claimCustomer?.name || 'N/A'}</p>
                      </div>
                      {claimCustomer?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-semibold">{claimCustomer.phone}</p>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Policy Number</p>
                        <p className="font-semibold">{claimCustomer?.policyNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order #{orderDetails.orderNumber}
                  </span>
                  <Badge variant={getStatusColor(orderDetails.status)}>
                    {orderDetails.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-semibold">{formatCurrency(orderDetails.total)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="font-semibold">{formatDate(orderDetails.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-semibold">{orderDetails.paymentMethod || 'Cash'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            {orderDetails.customer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-semibold">{orderDetails.customer.name}</p>
                    </div>
                    {orderDetails.customer.email && (
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold">{orderDetails.customer.email}</p>
                      </div>
                    )}
                    {orderDetails.customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-semibold">{orderDetails.customer.phone}</p>
                        </div>
                      </div>
                    )}
                    {orderDetails.customer.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p className="font-semibold">{orderDetails.customer.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>
                  {orderDetails.orderItems.length} item{orderDetails.orderItems.length !== 1 ? 's' : ''} in this order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetails.orderItems.map((item, index) => (
                    <div key={item.id || index}>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          {item.productCode && (
                            <p className="text-sm text-muted-foreground">Code: {item.productCode}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <p className="text-sm text-muted-foreground">Quantity</p>
                            <p className="font-medium">{item.quantity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Unit Price</p>
                            <p className="font-medium">{formatCurrency(item.unitPrice)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                          </div>
                        </div>
                      </div>
                      {index < orderDetails.orderItems.length - 1 && <Separator />}
                    </div>
                  ))}
                  
                  <Separator />
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-lg font-semibold">Order Total:</span>
                    <span className="text-lg font-bold">{formatCurrency(orderDetails.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {orderDetails.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{orderDetails.notes}</p>
                </CardContent>
              </Card>
              )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No order details available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 