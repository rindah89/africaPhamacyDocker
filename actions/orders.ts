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
    console.log(`Fetching ${count} recent unique customers for dashboard - SIMPLIFIED`);
    try {
      // Get recent orders - remove the problematic WHERE clause
      const recentOrders = await prisma.lineOrder.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: Math.min(count * 10, 200), // Get more to account for null filtering
        select: {
          customerId: true,
          createdAt: true,
          customerName: true,
          customerEmail: true,
        }
      });

      console.log(`Found ${recentOrders.length} recent orders`);

      // Filter out orders without valid customer IDs in JavaScript
      const ordersWithCustomers = recentOrders.filter(order => 
        order.customerId && 
        typeof order.customerId === 'string' && 
        order.customerId.trim() !== ''
      );

      console.log(`Found ${ordersWithCustomers.length} orders with valid customer IDs`);

      if (ordersWithCustomers.length === 0) {
        console.log('No orders with valid customer IDs found, using fallback');
        // Fallback: get recent users directly
        const fallbackCustomers = await prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: count,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
            createdAt: true,
          }
        });
        return fallbackCustomers as OrderCustomer[];
      }

      // Get unique customer IDs
      const uniqueCustomerIds = [...new Set(
        ordersWithCustomers.map(order => order.customerId)
      )].slice(0, count * 2); // Get a few extra to ensure we have enough

      console.log(`Found ${uniqueCustomerIds.length} unique customer IDs`);

      // Get customer details
      const customers = await prisma.user.findMany({
        where: {
          id: {
            in: uniqueCustomerIds
          }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          profileImage: true,
          createdAt: true,
        }
      });

      console.log(`Retrieved ${customers.length} customer details`);

      // Sort by most recent order and limit to requested count
      const customersWithOrderDate = customers.map(customer => {
        const mostRecentOrder = ordersWithCustomers.find(order => order.customerId === customer.id);
        return {
          ...customer,
          lastOrderDate: mostRecentOrder?.createdAt || customer.createdAt
        };
      }).sort((a, b) => b.lastOrderDate.getTime() - a.lastOrderDate.getTime());

      const result = customersWithOrderDate.slice(0, count).map(customer => ({
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        profileImage: customer.profileImage,
        createdAt: customer.createdAt
      })) as OrderCustomer[];

      console.log(`Returning ${result.length} recent customers for dashboard`);
      return result;

    } catch (error) {
      console.error("Error fetching recent customers for dashboard:", error);
      
      // Ultimate fallback: just get recent users
      try {
        console.log('Using ultimate fallback - recent users only');
        const fallbackCustomers = await prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: count,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
            createdAt: true,
          }
        });
        
        console.log(`Ultimate fallback returned ${fallbackCustomers.length} customers`);
        return fallbackCustomers as OrderCustomer[];
      } catch (fallbackError) {
        console.error("Ultimate fallback also failed:", fallbackError);
        return [];
      }
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
