"use server";

import { prisma } from "@/lib/db";
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

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

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
  amountPaid: number
) {
  try {
    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      // Create the order
      const order = await tx.lineOrder.create({
        data: {
          orderNumber,
          orderType: orderData.orderType,
          source: orderData.source,
          orderAmount: orderData.orderAmount,
          customerId: customerData.customerId,
          customerName: customerData.customerName,
          customerEmail: customerData.customerEmail,
          lineOrderItems: {
            create: orderData.orderItems.map(item => ({
              productId: item.id,
              name: item.name,
              qty: item.qty,
              price: item.price,
              productThumbnail: item.productThumbnail
            }))
          }
        }
      });

      // Update product stock quantities
      for (const item of orderData.orderItems) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stockQty: {
              decrement: item.qty
            }
          }
        });
      }

      return order;
    });

    revalidatePath("/pos");
    return { success: true, order: result };
  } catch (error: any) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      message: error.message || "Failed to process payment and create order"
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
    
    // Pre-check available batches for all products before starting transaction
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

      const availableQty = availableBatches.reduce((sum, batch) => sum + batch.quantity, 0);
      console.log(`Product ${item.name}: Required qty=${item.qty}, Available qty=${availableQty}`);
      
      if (availableQty < item.qty) {
        throw new Error(`Insufficient batch quantity for product: ${item.name}`);
      }
      return { item, availableBatches };
    }));

    console.log('Starting first transaction - Critical Operations...');
    // First transaction for critical operations
    const lineOrderId = await prisma.$transaction(async (transaction: TransactionClient) => {
      // Create the Line Order first
      const lineOrder = await transaction.lineOrder.create({
        data: {
          customerId: customerData.customerId,
          customerName: customerData.customerName,
          customerEmail: customerData.customerEmail,
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
          orderAmount,
          orderType,
          source,
          status: source === "pos" ? "PENDING" : "PROCESSING",
        },
      });
      console.log('Main order created with ID:', lineOrder.id);

      // Process all items in parallel within the transaction
      console.log('Processing order items...');
      await Promise.all(batchChecks.map(async ({ item, availableBatches }) => {
        let remainingQty = item.qty;
        
        // Update batches
        console.log(`Updating batches for product ${item.name}...`);
        for (const batch of availableBatches) {
          if (remainingQty <= 0) break;
          const deductionQty = Math.min(batch.quantity, remainingQty);
          await transaction.productBatch.update({
            where: { id: batch.id },
            data: { quantity: { decrement: deductionQty } }
          });
          remainingQty -= deductionQty;
        }

        // Update product stock
        console.log(`Updating stock for product ${item.name}...`);
        await transaction.product.update({
          where: { id: item.id },
          data: { stockQty: { decrement: item.qty } },
        });

        // Create line order item
        console.log(`Creating line item for product ${item.name}...`);
        await transaction.lineOrderItem.create({
          data: {
            orderId: lineOrder.id,
            productId: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            productThumbnail: item.productThumbnail,
          },
        });
      }));

      console.log('Critical operations completed');
      return lineOrder.id;
    }, {
      timeout: 14000 // Increased timeout to 14 seconds
    });

    // Second transaction for non-critical operations (sales records)
    console.log('Starting second transaction - Sales Records...');
    await prisma.$transaction(async (transaction: TransactionClient) => {
      await Promise.all(orderItems.map(async (item) => {
        // Create sale record
        console.log(`Creating sale record for product ${item.name}...`);
        await transaction.sale.create({
          data: {
            orderId: lineOrderId,
            productId: item.id,
            qty: item.qty,
            salePrice: item.price,
            productName: item.name,
            productImage: item.productThumbnail,
            customerName: customerData.customerName,
            customerEmail: customerData.customerEmail,
          },
        });
      }));
      console.log('Sales records created successfully');
    }, {
      timeout: 14000 // Increased timeout to 14 seconds
    });

    console.log('All transactions completed successfully');

    // Handle non-critical operations outside transactions
    console.log('Processing post-transaction operations...');
    const updatedProducts = await prisma.product.findMany({
      where: { id: { in: orderItems.map(item => item.id) } }
    });

    // Create notifications for low stock outside the transaction
    await Promise.all(updatedProducts.map(async (product: Product) => {
      if (product.stockQty < product.alertQty) {
        const message = product.stockQty === 0
          ? `The stock of ${product.name} is out. Current stock: ${product.stockQty}.`
          : `The stock of ${product.name} has gone below threshold. Current stock: ${product.stockQty}.`;
        const statusText = product.stockQty === 0 ? "Stock Out" : "Warning";
        const status: NotificationStatus = product.stockQty === 0 ? "DANGER" : "WARNING";

        await createNotification({
          message,
          status,
          statusText,
        });
      }
    }));

    revalidatePath("/dashboard/sales");

    console.log('Fetching final order details...');
    const savedLineOrder = await prisma.lineOrder.findUnique({
      where: { id: lineOrderId },
      include: { lineOrderItems: true },
    });

    console.log('Order creation completed successfully');
    return savedLineOrder;
  } catch (error) {
    console.error("Transaction error:", error);
    // Add more detailed error information
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
      orderBy: {
        createdAt: "desc",
      },
      include: {
        lineOrderItems: true,
      },
    });
    const orders = allOrders.filter((order: LineOrder & { lineOrderItems: any[] }) => order.lineOrderItems.length > 0);
    return orders;
  } catch (error) {
    console.log(error);
  }
}