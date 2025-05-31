"use server";

import prisma from "@/lib/db";
import { withCache, cacheKeys } from "@/lib/cache";
import { revalidatePath } from "next/cache";
import { OrderLineItem } from "@/redux/slices/pointOfSale";
import { NotificationStatus, Prisma, PrismaClient, Product, LineOrder } from "@prisma/client";
import { generateOrderNumber } from "@/lib/generateOrderNumbers";
import { ILineOrder } from "@/types/types";

// Define the PaymentMethod type based on the Prisma schema
type PaymentMethod = Prisma.LineOrderCreateInput['paymentMethod']

interface CustomerData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  streetAddress?: string;
  apartment?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  method?: PaymentMethod;
}

interface OrderData {
  orderItems: OrderLineItem[];
  orderAmount: number;
  orderType: string;
  source: string;
}

type NotificationProps = {
  message: string;
  status?: NotificationStatus;
  statusText: string;
};

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'> & {
  sale: PrismaClient['sale']
};

export async function createNotification(data: NotificationProps) {
  try {
    const newNot = await prisma.notification.create({
      data,
    });
    revalidatePath("/dashboard");
    return newNot;
  } catch (error) {
    console.log(error);
  }
}

export async function updateNotificationStatusById(id: string) {
  try {
    const updatedNot = await prisma.notification.update({
      where: {
        id,
      },
      data: {
        read: true,
      },
    });
    revalidatePath("/dashboard");
    return updatedNot;
  } catch (error) {
    console.log(error);
  }
}

export async function getNotifications() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        read: false,
      },
    });
    return notifications;
  } catch (error) {
    console.log(error);
  }
}

// Step 1: Validate and prepare order
export async function validateOrder(orderData: OrderData, customerData: CustomerData) {
  try {
    // Validate customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerData.customerId },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Validate all products and their quantities
    for (const item of orderData.orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        include: { batches: true },
      });

      if (!product) {
        throw new Error(`Product ${item.name} not found`);
      }

      if (product.stockQty < item.qty) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
    }

    // Generate order number
    const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();

    return {
      success: true,
      orderNumber,
      message: "Order validated successfully"
    };
  } catch (error: any) {
    console.error("Order validation error:", error);
    return {
      success: false,
      message: error.message || "Failed to validate order"
    };
  }
}

// Step 2: Process payment and create order
export async function processPaymentAndOrder(
  orderData: OrderData, 
  customerData: CustomerData,
  orderNumber: string,
  amountPaid: number,
  insuranceData?: {
    providerId: string;
    providerName: string;
    percentage: number;
    insuranceAmount: number;
    customerAmount: number;
    customerName: string;
    policyNumber: string;
  } | null
) {
  console.log('🚀 Starting processPaymentAndOrder:', {
    orderNumber,
    amountPaid,
    customerName: customerData.customerName,
    itemCount: orderData.orderItems.length,
    totalAmount: orderData.orderAmount,
    hasInsurance: !!insuranceData
  });

  try {
    // Use transaction to ensure all operations succeed or fail together
    const order = await prisma.$transaction(async (tx) => {
      console.log('📦 Creating order in transaction');
      
      // Create order and line items
      const newOrder = await tx.lineOrder.create({
        data: {
          orderNumber,
          orderType: orderData.orderType,
          source: orderData.source,
          orderAmount: Math.round(orderData.orderAmount),
          amountPaid: Math.round(amountPaid),
          customerId: customerData.customerId,
          customerName: customerData.customerName || 'Walk-in Customer',
          customerEmail: customerData.customerEmail || customerData.email || null,
          paymentMethod: insuranceData ? 'INSURANCE' : customerData.method ?? 'NONE',
          // Insurance fields (will be updated after claim creation)
          insuranceAmount: insuranceData?.insuranceAmount || null,
          customerPaidAmount: insuranceData?.customerAmount || null,
          insurancePercentage: insuranceData?.percentage || null,
          insuranceProviderName: insuranceData?.providerName || null,
          insurancePolicyNumber: insuranceData?.policyNumber || null,
          lineOrderItems: {
            create: orderData.orderItems.map(item => ({
              productId: item.id,
              name: item.name,
              qty: item.qty,
              price: item.price,
              productThumbnail: item.productThumbnail
            }))
          }
        },
        include: {
          lineOrderItems: true
        }
      });

      console.log('✅ Order created successfully:', {
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        itemCount: newOrder.lineOrderItems.length
      });

      // Create insurance claim first if insurance data is provided
      let createdClaim = null;
      if (insuranceData) {
        console.log('🏥 Creating insurance claim');
        
        // Generate claim number
        const claimNumber = `CLM-${Date.now()}`;
        
        createdClaim = await tx.insuranceClaim.create({
          data: {
            claimNumber,
            orderNumber: newOrder.orderNumber,
            customerName: insuranceData.customerName,
            policyNumber: insuranceData.policyNumber,
            totalAmount: orderData.orderAmount,
            insurancePercentage: insuranceData.percentage,
            insuranceAmount: insuranceData.insuranceAmount,
            customerAmount: insuranceData.customerAmount,
            providerId: insuranceData.providerId,
            claimItems: {
              create: orderData.orderItems.map(item => ({
                productName: item.name,
                quantity: item.qty,
                unitPrice: item.price,
                totalPrice: item.price * item.qty
              }))
            }
          },
          include: {
            provider: true,
            claimItems: true
          }
        });

        console.log('✅ Insurance claim created:', {
          claimId: createdClaim.id,
          claimNumber: createdClaim.claimNumber,
          providerName: insuranceData.providerName,
          insuranceAmount: insuranceData.insuranceAmount
        });

        // Update the order with the insurance claim ID
        await tx.lineOrder.update({
          where: { id: newOrder.id },
          data: { insuranceClaimId: createdClaim.id }
        });

        console.log('✅ Order updated with insurance claim ID:', {
          orderId: newOrder.id,
          claimId: createdClaim.id
        });
      }

      // Process each order item
      for (const item of orderData.orderItems) {
        console.log(`📝 Processing order item: ${item.name}`);
        
        // Get available batches ordered by expiry date (FIFO)
        const batches = await tx.productBatch.findMany({
          where: {
            productId: item.id,
            status: true,
            quantity: { gt: 0 }
          },
          orderBy: { expiryDate: 'asc' }
        });

        console.log(`Found ${batches.length} active batches for ${item.name}`);

        let remainingQty = item.qty;
        // Deduct quantities from batches
        for (const batch of batches) {
          if (remainingQty <= 0) break;

          const deductionQty = Math.min(batch.quantity, remainingQty);
          await tx.productBatch.update({
            where: { id: batch.id },
            data: { quantity: { decrement: deductionQty } }
          });
          remainingQty -= deductionQty;
          
          console.log(`Updated batch ${batch.id}: deducted ${deductionQty} units`);
        }

        // Update product's total stock quantity
        await tx.product.update({
          where: { id: item.id },
          data: { stockQty: { decrement: item.qty } }
        });

        console.log(`Updated product stock for ${item.name}`);

        // Calculate insurance amounts per item (proportional to item price)
        const itemTotal = item.price * item.qty;
        const itemInsuranceAmount = insuranceData 
          ? (itemTotal * insuranceData.percentage) / 100 
          : null;
        const itemCustomerAmount = insuranceData 
          ? itemTotal - itemInsuranceAmount 
          : null;

        // Create sale record with insurance data if applicable
        await tx.sale.create({
          data: {
            orderId: newOrder.id,
            orderNumber: newOrder.orderNumber,
            productId: item.id,
            qty: item.qty,
            salePrice: item.price,
            total: itemTotal,
            productName: item.name,
            productImage: item.productThumbnail || '',
            customerName: customerData.customerName || 'Walk-in Customer',
            customerEmail: customerData.customerEmail || customerData.email || null,
            paymentMethod: insuranceData ? 'INSURANCE' : customerData.method ?? 'NONE',
            // Insurance fields (null if no insurance)
            insuranceClaimId: createdClaim?.id || null,
            insuranceAmount: itemInsuranceAmount,
            customerPaidAmount: itemCustomerAmount,
            insurancePercentage: insuranceData?.percentage || null,
          }
        });

        console.log(`Created sale record for ${item.name}`, {
          hasInsurance: !!insuranceData,
          itemInsuranceAmount,
          itemCustomerAmount
        });

        // Check if stock is below alert quantity
        const updatedProduct = await tx.product.findUnique({
          where: { id: item.id }
        });

        if (updatedProduct && updatedProduct.stockQty <= updatedProduct.alertQty) {
          console.log(`⚠️ Low stock alert for ${updatedProduct.name}: ${updatedProduct.stockQty} units remaining`);
          await createNotification({
            message: updatedProduct.stockQty === 0
              ? `The stock of ${updatedProduct.name} is out. Current stock: ${updatedProduct.stockQty}.`
              : `The stock of ${updatedProduct.name} has gone below threshold. Current stock: ${updatedProduct.stockQty}.`,
            status: updatedProduct.stockQty === 0 ? "DANGER" : "WARNING",
            statusText: updatedProduct.stockQty === 0 ? "Stock Out" : "Warning",
          });
        }
      }

      return newOrder;
    });

    console.log('🎉 Order processing completed successfully:', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      hasInsurance: !!insuranceData
    });

    revalidatePath("/pos");
    revalidatePath("/dashboard/insurance-partners");
    return { success: true, order };
  } catch (error: any) {
    console.error("❌ Order creation error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return {
      success: false,
      message: error.message || "Failed to create order"
    };
  }
}

export async function createLineOrder(
  newOrder: OrderData,
  customerData: CustomerData
) {
  const { orderItems, orderAmount, orderType, source } = newOrder;
  try {
    console.log('Starting order creation process...');
    
    // Pre-check available batches
    console.log('Checking batch quantities...');
    const batchChecks = await Promise.all(orderItems.map(async (item) => {
      const availableBatches = await prisma.productBatch.findMany({
        where: {
          productId: item.id,
          status: true,
          quantity: { gt: 0 }
        },
        orderBy: { expiryDate: 'asc' }
      });

      const availableQty = availableBatches.reduce((sum: number, batch: { quantity: number }) => sum + batch.quantity, 0);
      if (availableQty < item.qty) {
        throw new Error(`Insufficient batch quantity for product: ${item.name}`);
      }
      return { item, availableBatches };
    }));

    // Get the customer email from either customerEmail or email field
    const customerEmail = customerData.customerEmail || customerData.email || null;

    // Create the base order first
    const lineOrder = await prisma.lineOrder.create({
      data: {
        customerId: customerData.customerId,
        customerName: customerData.customerName || 'Walk-in Customer',
        customerEmail,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        email: customerData.email,
        streetAddress: customerData.streetAddress,
        apartment: customerData.apartment,
        city: customerData.city,
        state: customerData.state,
        zipCode: customerData.zipCode,
        country: customerData.country,
        paymentMethod: customerData.method ?? 'NONE' as PaymentMethod,
        orderNumber: generateOrderNumber(),
        orderAmount: Math.round(orderAmount), // Convert to integer as per schema
        orderType,
        source,
        status: source === "pos" ? "PENDING" : "PROCESSING",
      }
    });

    // Process items in chunks
    const CHUNK_SIZE = 5;
    for (let i = 0; i < batchChecks.length; i += CHUNK_SIZE) {
      const chunk = batchChecks.slice(i, i + CHUNK_SIZE);
      
      await prisma.$transaction(async (tx: TransactionClient) => {
        for (const { item, availableBatches } of chunk) {
          let remainingQty = item.qty;
          
          // Update batches
          for (const batch of availableBatches) {
            if (remainingQty <= 0) break;
            const deductionQty = Math.min(batch.quantity, remainingQty);
            await tx.productBatch.update({
              where: { id: batch.id },
              data: { quantity: { decrement: deductionQty } }
            });
            remainingQty -= deductionQty;
          }

          // Update product stock
          await tx.product.update({
            where: { id: item.id },
            data: { stockQty: { decrement: item.qty } }
          });

          // Create line order item
          await tx.lineOrderItem.create({
            data: {
              orderId: lineOrder.id,
              productId: item.id,
              name: item.name,
              price: item.price,
              qty: item.qty,
              productThumbnail: item.productThumbnail,
            }
          });

          // Create sale record with all required fields
          await tx.sale.create({
            data: {
              orderId: lineOrder.id,
              orderNumber: lineOrder.orderNumber,
              productId: item.id,
              qty: item.qty,
              salePrice: item.price,
              total: item.price * item.qty,
              productName: item.name,
              productImage: item.productThumbnail || '',
              customerName: customerData.customerName || 'Walk-in Customer',
              customerEmail, // Use the same email value as the order
              paymentMethod: customerData.method ?? 'NONE'
            }
          });
        }
      });
    }

    // Handle notifications outside of transactions
    const updatedProducts = await prisma.product.findMany({
      where: { id: { in: orderItems.map(item => item.id) } }
    });

    for (const product of updatedProducts) {
      if (product.stockQty < product.alertQty) {
        const message = product.stockQty === 0
          ? `The stock of ${product.name} is out. Current stock: ${product.stockQty}.`
          : `The stock of ${product.name} has gone below threshold. Current stock: ${product.stockQty}.`;
        await createNotification({
          message,
          status: product.stockQty === 0 ? "DANGER" : "WARNING",
          statusText: product.stockQty === 0 ? "Stock Out" : "Warning",
        });
      }
    }

    revalidatePath("/dashboard/sales");

    const savedLineOrder = await prisma.lineOrder.findUnique({
      where: { id: lineOrder.id },
      include: { lineOrderItems: true },
    });

    return savedLineOrder;
  } catch (error) {
    console.error("Transaction error:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

export async function getOrders() {
  try {
    const allOrders = await prisma.lineOrder.findMany({
      where: {
        lineOrderItems: {
          some: {} // Only fetch orders that have line items
        }
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to 100 orders for better performance
      include: {
        lineOrderItems: {
          take: 5, // Limit line items per order
          select: {
            id: true,
            productId: true,
            name: true,
            qty: true,
            price: true,
            productThumbnail: true,
          }
        },
      },
    });
    return allOrders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

// Get all orders without filtering (for debugging)
export async function getAllOrdersNoFilter() {
  try {
    const allOrders = await prisma.lineOrder.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      include: {
        lineOrderItems: true,
      },
    });
    return allOrders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

// Optimized orders fetching with pagination
export async function getAllOrdersPaginated(page = 1, limit = 20) {
  return withCache(cacheKeys.orders(page, limit), async () => {
    try {
      const skip = (page - 1) * limit;
      
      // Get orders with pagination and only essential data
      const orders = await prisma.lineOrder.findMany({
        where: {
          lineOrderItems: {
            some: {} // Only include orders that have line items
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          // Core fields
          id: true,
          customerId: true,
          customerName: true,
          orderNumber: true,
          customerEmail: true, 
          
          // Order details
          orderAmount: true,
          amountPaid: true,
          orderType: true,
          source: true,
          status: true,
          paymentMethod: true,

          // ECOMMERCE Personal Details
          firstName: true,
          lastName: true,
          email: true, 
          phone: true,
          
          // ECOMMERCE Shipping Details
          streetAddress: true,
          apartment: true,
          city: true,
          state: true,
          country: true,
          zipCode: true,

          // Insurance-related fields
          insuranceClaimId: true,
          insuranceAmount: true,
          customerPaidAmount: true,
          insurancePercentage: true,
          insuranceProviderName: true,
          insurancePolicyNumber: true,
          
          // Timestamps
          createdAt: true,
          updatedAt: true,

          // Relation
          lineOrderItems: {
            select: {
              id: true,
              productId: true,
              name: true,
              qty: true,
              price: true,
              productThumbnail: true,
            },
            take: 5
          }
        },
      });

      // Get total count for pagination
      const totalCount = await prisma.lineOrder.count({
        where: {
          lineOrderItems: {
            some: {}
          }
        }
      });

      return {
        orders,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
      };

    } catch (error) {
      console.log(error);
      return null;
    }
  }, 3 * 60 * 1000); // Cache for 3 minutes
}

// Optimized orders fetching for minimal data (for dropdowns, etc.)
export async function getOrdersMinimal(page = 1, limit = 10) {
  return withCache(cacheKeys.ordersMinimal(page, limit), async () => {
    try {
      const skip = (page - 1) * limit;
      
      const orders = await prisma.lineOrder.findMany({
        where: {
          lineOrderItems: {
            some: {}
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          status: true,
          orderAmount: true,
          createdAt: true,
          _count: {
            select: {
              lineOrderItems: true
            }
          }
        },
      });

      return orders;
    } catch (error) {
      console.log(error);
      return null;
    }
  }, 5 * 60 * 1000); // Cache for 5 minutes
}