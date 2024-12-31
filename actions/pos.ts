"use server";

import prisma from "@/lib/db";
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
    const lineOrderId = await prisma.$transaction(async (transaction) => {
      // Generate order number with format: KP-YYYY-MM-XXXXX
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      
      // Function to generate a random 5-digit number
      const generateRandomNumber = () => 
        Math.floor(10000 + Math.random() * 90000).toString();
      
      // Generate initial order number
      let randomNumber = generateRandomNumber();
      let orderNumber = `KP-${year}-${month}-${randomNumber}`;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      // Try to ensure uniqueness
      while (!isUnique && attempts < maxAttempts) {
        // Check if this order number already exists
        const existingOrder = await transaction.lineOrder.findUnique({
          where: { orderNumber },
        });
        
        if (!existingOrder) {
          isUnique = true;
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            randomNumber = generateRandomNumber();
            orderNumber = `KP-${year}-${month}-${randomNumber}`;
          }
        }
      }
      
      if (!isUnique) {
        throw new Error('Failed to generate unique order number after multiple attempts');
      }
      
      // Create the Line Order
      const lineOrder = await transaction.lineOrder.create({
        data: {
          customerId: customerData.customerId,
          customerName: customerData.customerName,
          customerEmail: customerData.customerEmail,
          // Personal Details
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phone: customerData.phone,
          email: customerData.email,
          // Shipping address
          streetAddress: customerData.streetAddress,
          apartment: customerData.apartment,
          city: customerData.city,
          state: customerData.state,
          zipCode: customerData.zipCode,
          country: customerData.country,
          paymentMethod: customerData.method ?? 'CASH' as PaymentMethod,
          orderNumber,
          orderAmount,
          orderType,
          source,
          status: source === "pos" ? "PENDING" : "PROCESSING",
        },
      });

      // Process each order item
      for (const item of orderItems) {
        // Update Product stock quantity
        const updatedProduct = await transaction.product.update({
          where: { id: item.id },
          data: {
            stockQty: {
              decrement: item.qty,
            },
          },
        });

        if (!updatedProduct) {
          throw new Error(`Failed to update stock for product ID: ${item.id}`);
        }

        if (updatedProduct.stockQty < updatedProduct.alertQty) {
          // Send/Create the Notification
          const message =
            updatedProduct.stockQty === 0
              ? `The stock of ${updatedProduct.name} is out. Current stock: ${updatedProduct.stockQty}.`
              : `The stock of ${updatedProduct.name} has gone below threshold. Current stock: ${updatedProduct.stockQty}.`;
          const statusText =
            updatedProduct.stockQty === 0 ? "Stock Out" : "Warning";
          const status: NotificationStatus =
            updatedProduct.stockQty === 0 ? "DANGER" : "WARNING";

          const newNotification = {
            message,
            status,
            statusText,
          };
          await createNotification(newNotification);
        }

        // Create Line Order Item
        const lineOrderItem = await transaction.lineOrderItem.create({
          data: {
            orderId: lineOrder.id,
            productId: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            productThumbnail: item.productThumbnail,
          },
        });

        if (!lineOrderItem) {
          throw new Error(
            `Failed to create line order item for product ID: ${item.id}`
          );
        }

        // Create Sale
        const sale = await transaction.sale.create({
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

        if (!sale) {
          throw new Error(`Failed to create sale for product ID: ${item.id}`);
        }
      }
      
      revalidatePath("/dashboard/sales");
      return lineOrder.id;
    });

    const savedLineOrder = await prisma.lineOrder.findUnique({
      where: {
        id: lineOrderId,
      },
      include: {
        lineOrderItems: true,
      },
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
