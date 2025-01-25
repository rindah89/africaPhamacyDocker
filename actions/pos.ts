"use server";

import prisma from "@/lib/db";
import { generateOrderNumber } from "@/lib/generateOrderNumbers";
import { ILineOrder } from "@/types/types";
import { NotificationStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Define the PaymentMethod type based on the Prisma schema
type PaymentMethod = Prisma.LineOrderCreateInput['paymentMethod']

interface OrderLineItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  productThumbnail: string;
}

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

interface NewOrderProps {
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

export async function createLineOrder(
  newOrder: NewOrderProps,
  customerData: CustomerData
) {
  const { orderItems, orderAmount, orderType, source } = newOrder;
  try {
    // Pre-check available batches for all products before starting transaction
    for (const item of orderItems) {
      const availableBatches = await prisma.productBatch.findMany({
        where: {
          productId: item.id,
          status: true,
          quantity: { gt: 0 }
        },
        orderBy: { expiryDate: 'asc' }
      });

      let availableQty = availableBatches.reduce((sum, batch) => sum + batch.quantity, 0);
      if (availableQty < item.qty) {
        throw new Error(`Insufficient batch quantity for product: ${item.name}`);
      }
    }

    // Main transaction for critical operations
    const lineOrderId = await prisma.$transaction(async (transaction) => {
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

      // Process each item in parallel within the transaction
      await Promise.all(orderItems.map(async (item) => {
        // Find and update batches
        const availableBatches = await transaction.productBatch.findMany({
          where: {
            productId: item.id,
            status: true,
            quantity: { gt: 0 }
          },
          orderBy: { expiryDate: 'asc' }
        });

        let remainingQty = item.qty;
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
        const updatedProduct = await transaction.product.update({
          where: { id: item.id },
          data: { stockQty: { decrement: item.qty } },
        });

        // Create line order item
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

        // Create sale record
        await transaction.sale.create({
          data: {
            orderId: lineOrder.id,
            productId: item.id,
            qty: item.qty,
            salePrice: item.price,
            productName: item.name,
            productImage: item.productThumbnail,
            customerName: customerData.customerName,
            customerEmail: customerData.customerEmail,
          },
        });

        return updatedProduct;
      }));

      return lineOrder.id;
    }, {
      timeout: 20000 // Reduced timeout since we optimized the transaction
    });

    // Handle non-critical operations outside the transaction
    const updatedProducts = await prisma.product.findMany({
      where: { id: { in: orderItems.map(item => item.id) } }
    });

    // Create notifications for low stock outside the transaction
    await Promise.all(updatedProducts.map(async (product) => {
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

    const savedLineOrder = await prisma.lineOrder.findUnique({
      where: { id: lineOrderId },
      include: { lineOrderItems: true },
    });

    return savedLineOrder as ILineOrder;
  } catch (error) {
    console.error("Transaction error:", error);
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
    const orders = allOrders.filter((order) => order.lineOrderItems.length > 0);
    return orders;
  } catch (error) {
    console.log(error);
  }
}