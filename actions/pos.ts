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
    // Create order and line items only
    const order = await prisma.lineOrder.create({
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
      },
      include: {
        lineOrderItems: true
      }
    });

    revalidatePath("/pos");
    return { success: true, order };
  } catch (error: any) {
    console.error("Order creation error:", error);
    return {
      success: false,
      message: error.message || "Failed to create order"
    };
  }
}

// New function to create sales records
export async function createSalesRecords(
  orderId: string,
  orderItems: OrderLineItem[],
  customerName: string,
  customerEmail: string
) {
  try {
    // Process items in chunks to avoid timeouts
    const CHUNK_SIZE = 5;
    for (let i = 0; i < orderItems.length; i += CHUNK_SIZE) {
      const chunk = orderItems.slice(i, i + CHUNK_SIZE);
      
      await prisma.$transaction(async (tx: TransactionClient) => {
        for (const item of chunk) {
          // Update stock
          await tx.product.update({
            where: { id: item.id },
            data: { stockQty: { decrement: item.qty } }
          });

          // Create sale record
          await tx.sale.create({
            data: {
              orderId: orderId,
              productId: item.id,
              qty: item.qty,
              salePrice: item.price,
              productName: item.name,
              productImage: item.productThumbnail || '',
              customerName: customerName || 'Walk-in Customer',
              customerEmail: customerEmail || '',
              orderNumber: generateOrderNumber(),
              total: item.qty * item.price
            },
          });
        }
      });
      
      // Small delay between chunks
      if (i + CHUNK_SIZE < orderItems.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Sales creation error:", error);
    return {
      success: false,
      message: error.message || "Failed to create sales records"
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

    // Create the base order first
    const lineOrder = await prisma.lineOrder.create({
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