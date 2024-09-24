"use server";

import prisma from "@/lib/db";
import { ILineOrder } from "@/types/types";

export async function getAllSales() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return sales;
  } catch (error) {
    console.log(error);
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
