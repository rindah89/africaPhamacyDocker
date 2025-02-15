"use server";

import prisma from "@/lib/db";
import { ILineOrder } from "@/types/types";

export async function getAllSales(startDate?: Date, endDate?: Date) {
  try {
    const where = startDate && endDate ? {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    } : undefined;

    const sales = await prisma.sale.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        qty: true,
        salePrice: true,
        productName: true,
        productImage: true,
        customerName: true,
        customerEmail: true,
        paymentMethod: true,
        createdAt: true,
        updatedAt: true,
        orderId: true,
        productId: true,
        product: {
          select: {
            id: true,
            name: true,
            productCode: true,
            productThumbnail: true,
            supplierPrice: true
          }
        },
        lineOrder: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            customerName: true,
            customerEmail: true
          }
        }
      }
    });
    
    if (!sales) {
      return [];
    }
    
    return sales;
  } catch (error) {
    console.error("Error fetching sales:", error);
    return []; // Return empty array instead of throwing to match analytics pattern
  }
}

export async function getOrderById(id: string) {
  try {
    const order = await prisma.lineOrder.findUnique({
      where: {
        id,
      },
      include: {
        lineOrderItems: true,
      },
    });
    return order as ILineOrder;
  } catch (error) {
    console.log(error);
  }
}
