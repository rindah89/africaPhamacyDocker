"use server";

import prisma from "@/lib/db";
import { ICustomer, ILineOrder, OrderCustomer } from "@/types/types";
import { OrderStatus } from "@prisma/client";
import { withCache, cacheKeys } from "@/lib/cache";

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

export async function getOrderByNumber(orderNumber: string) {
  try {
    const order = await prisma.lineOrder.findFirst({
      where: {
        orderNumber,
      },
      include: {
        lineOrderItems: {
          include: {
            product: {
              select: {
                productCode: true,
                name: true,
              }
            }
          }
        },
        insuranceClaim: {
          include: {
            provider: true
          }
        }
      },
    });

    if (!order) {
      return null;
    }

    // Transform the data to match our OrderDetails interface
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.orderAmount,
      status: order.status,
      paymentMethod: order.paymentMethod || 'CASH',
      createdAt: order.createdAt,
      customer: {
        name: order.customerName || 'Walk-in Customer',
        email: order.customerEmail || undefined,
        phone: order.phone || undefined,
        address: order.streetAddress ? 
          `${order.streetAddress}${order.apartment ? ', ' + order.apartment : ''}, ${order.city || ''}, ${order.country || ''}`.trim() 
          : undefined,
      },
      orderItems: order.lineOrderItems.map(item => ({
        id: item.id,
        productName: item.name,
        productCode: item.product?.productCode || undefined,
        quantity: item.qty,
        unitPrice: item.price,
        totalPrice: item.price * item.qty,
      })),
      notes: order.notes || undefined,
    };
  } catch (error) {
    console.log('Error fetching order by number:', error);
    throw error;
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

export async function getRecentCustomersForDashboard(count: number = 5) {
  return withCache(cacheKeys.recentCustomersDashboard(count), async () => {
    console.log(`Fetching ${count} recent unique customers for dashboard (from cache or fresh)`);
    try {
      const recentOrdersWithCustomers = await prisma.lineOrder.findMany({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          customerId: true,
          createdAt: true,
        },
        take: 100,
      });

      if (!recentOrdersWithCustomers || recentOrdersWithCustomers.length === 0) {
        return [];
      }

      const uniqueCustomerMap = new Map<string, Date>();
      for (const order of recentOrdersWithCustomers) {
        if (order.customerId) {
          if (!uniqueCustomerMap.has(order.customerId) || order.createdAt > uniqueCustomerMap.get(order.customerId)!) {
            uniqueCustomerMap.set(order.customerId, order.createdAt);
          }
        }
      }
      
      const sortedUniqueCustomerIds = Array.from(uniqueCustomerMap.entries())
        .sort((a, b) => b[1].getTime() - a[1].getTime())
        .slice(0, count)
        .map(entry => entry[0]);

      if (sortedUniqueCustomerIds.length === 0) {
        return [];
      }

      const customers = await prisma.user.findMany({
        where: {
          id: {
            in: sortedUniqueCustomerIds,
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          profileImage: true,
          createdAt: true,
        },
      });
      
      const customersMap = new Map(customers.map(c => [c.id, c]));
      const finalOrderedCustomers = sortedUniqueCustomerIds.map(id => customersMap.get(id)).filter(Boolean);

      return finalOrderedCustomers as OrderCustomer[];
    } catch (error) {
      console.error("Error fetching recent customers for dashboard:", error);
      return [];
    }
  }, 15 * 60 * 1000);
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
