"use server";

import prisma from "@/lib/db";
import { ICustomer, ILineOrder, OrderCustomer } from "@/types/types";
import { OrderStatus } from "@prisma/client";

// Define the PaymentMethod enum here as well
enum PaymentMethod {
  NONE = "NONE",
  CASH = "CASH",
  MOBILE_MONEY = "MOBILE_MONEY",
  ORANGE_MONEY = "ORANGE_MONEY",
  INSURANCE = "INSURANCE"
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
export type StatusData = {
  status: OrderStatus;
};
export async function changeOrderStatusById(id: string, data: StatusData) {
  try {
    const existingOrder = await prisma.lineOrder.findUnique({
      where: {
        id,
      },
    });
    if (!existingOrder) {
      return;
    }
    const updatedOrder = await prisma.lineOrder.update({
      where: {
        id,
      },
      data,
    });
    return {
      error: null,
      status: 200,
      data: updatedOrder,
    };
  } catch (error) {
    console.log(error);
    return {
      error,
      status: 500,
      data: null,
    };
  }
}
export async function getOrdersByCustomerId(
  id: string,
  page: number,
  pageSize: number
) {
  try {
    const orders = await prisma.lineOrder.findMany({
      where: {
        customerId: id,
      },
      include: {
        lineOrderItems: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const totalCount = await prisma.lineOrder.count({
      where: {
        customerId: id,
      },
    });
    return {
      orders: orders as ILineOrder[],
      totalCount,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function getCustomers() {
  try {
    const customerIds = await prisma.lineOrder.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        customerId: true,
      },
    });
    const userIds = customerIds.map((item) => item.customerId);
    const customers = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profileImage: true,
        createdAt: true,
        id: true,
      },
    });
    console.log(userIds);
    return customers as OrderCustomer[];
  } catch (error) {
    console.log(error);
  }
}

export type CustomerWithOrderDetails = {
  totalOrders: number;
  totalRevenue: number;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  profileImage: string | null;
  createdAt: Date;
};
export async function getCustomersWithOrders() {
  try {
    // Get customer details with total orders and total revenue from the Sale model
    const customersWithOrderStats = await prisma.sale.groupBy({
      by: ["customerEmail", "customerName"],
      _sum: {
        salePrice: true,
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _max: {
          createdAt: "desc",
        },
      },
    });
    // console.log(customersWithOrderStats);

    // Fetch additional user information for each customer
    const customers = await prisma.user.findMany({
      where: {
        email: {
          in: customersWithOrderStats.map((item) => item.customerEmail ?? ""),
        },
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profileImage: true,
        createdAt: true,
        id: true,
      },
    });

    // Merge the customer details with the order statistics
    const customersWithDetails = customers.map((customer) => {
      const orderStats = customersWithOrderStats.find(
        (stats) => stats.customerEmail === customer.email
      );

      return {
        ...customer,
        totalOrders: orderStats?._count._all || 0,
        totalRevenue: orderStats?._sum.salePrice || 0,
      };
    });
    // console.log(customersWithDetails);
    return customersWithDetails;
  } catch (error) {
    console.log(error);
  }
}

export type PaymentMethodData = {
  paymentMethod: PaymentMethod;
};

export async function changeOrderPaymentMethodById(orderId: string, data: PaymentMethodData) {
  try {
    const updatedOrder = await prisma.lineOrder.update({
      where: { id: orderId },
      data: { paymentMethod: data.paymentMethod },
    });

    return { status: 200, data: updatedOrder };
  } catch (error) {
    console.error("Error updating order payment method:", error);
    return { status: 500, error: "Failed to update order payment method" };
  }
}
