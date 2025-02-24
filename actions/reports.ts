import prisma from "@/lib/db";

export async function getInventoryReport() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        productCode: true,
        stockQty: true,
        supplierPrice: true,
        productPrice: true,
        alertQty: true,
        status: true,
        subCategory: {
          select: {
            title: true,
            category: {
              select: {
                title: true
              }
            }
          }
        },
        brand: {
          select: {
            title: true
          }
        },
        batches: {
          where: {
            status: true
          },
          select: {
            quantity: true,
            costPerUnit: true,
            expiryDate: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Calculate additional metrics
    const inventoryReport = products.map(product => {
      return {
        ...product,
        category: product.subCategory.category.title,
        subCategory: product.subCategory.title,
        brand: product.brand.title
      };
    });

    // Calculate totals
    const totals = inventoryReport.reduce((acc, product) => {
      return {
        totalItems: acc.totalItems + product.stockQty
      };
    }, {
      totalItems: 0
    });

    return {
      products: inventoryReport,
      totals
    };
  } catch (error) {
    console.error("Error fetching inventory report:", error);
    return null;
  }
}

export async function getSalesReport(startDate?: Date, endDate?: Date) {
  try {
    console.log('Starting getSalesReport...');
    
    // If no dates provided, default to current month
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    console.log('Date range:', { start, end });

    // First check if we have any orders
    const orderCount = await prisma.lineOrder.count({
      where: {
        createdAt: {
          gte: start,
          lte: end
        },
        status: 'DELIVERED'
      }
    });
    
    console.log('Total orders found:', orderCount);

    const orders = await prisma.lineOrder.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        },
        status: 'DELIVERED' // Only completed/delivered orders
      },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        customerName: true,
        customerEmail: true,
        lineOrderItems: {
          select: {
            id: true,
            qty: true,
            price: true,
            name: true,
            productThumbnail: true,
            product: {
              select: {
                id: true,
                productCode: true,
                supplierPrice: true,
                subCategory: {
                  select: {
                    title: true,
                    category: {
                      select: {
                        title: true
                      }
                    }
                  }
                },
                brand: {
                  select: {
                    title: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Orders fetched:', orders.length);
    if (orders.length > 0) {
      console.log('Sample order:', {
        id: orders[0].id,
        orderNumber: orders[0].orderNumber,
        itemCount: orders[0].lineOrderItems.length,
        total: orders[0].lineOrderItems.reduce((sum, item) => sum + (item.qty * item.price), 0)
      });
    }

    // Process orders and line items
    const salesReport = orders.flatMap(order => {
      const orderTotal = order.lineOrderItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
      
      return order.lineOrderItems.map(item => {
        const revenue = item.qty * item.price;
        const cost = item.qty * (item.product?.supplierPrice || 0);
        const profit = revenue - cost;

        return {
          id: item.id,
          orderId: order.id,
          orderNumber: order.orderNumber,
          date: order.createdAt,
          customerName: order.customerName || 'Walk-in Customer',
          customerEmail: order.customerEmail || '',
          orderTotal,
          productName: item.name,
          productCode: item.product?.productCode || '',
          category: item.product?.subCategory?.category?.title || '',
          subCategory: item.product?.subCategory?.title || '',
          brand: item.product?.brand?.title || '',
          quantity: item.qty,
          unitPrice: item.price,
          revenue,
          cost,
          profit
        };
      });
    });

    console.log('Sales report entries:', salesReport.length);
    if (salesReport.length > 0) {
      console.log('Sample sales entry:', {
        orderNumber: salesReport[0].orderNumber,
        productName: salesReport[0].productName,
        revenue: salesReport[0].revenue
      });
    }

    // Calculate totals
    const totals = salesReport.reduce((acc, sale) => {
      acc.orderIds.add(sale.orderId);
      return {
        orderIds: acc.orderIds,
        totalQuantity: acc.totalQuantity + sale.quantity,
        totalRevenue: acc.totalRevenue + sale.revenue,
        totalCost: acc.totalCost + sale.cost,
        totalProfit: acc.totalProfit + sale.profit
      };
    }, {
      orderIds: new Set<string>(),
      totalQuantity: 0,
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0
    });

    console.log('Calculated totals:', totals);

    // Calculate daily sales
    const dailySales = salesReport.reduce((acc, sale) => {
      const date = sale.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date: sale.date,
          orderIds: new Set<string>(),
          quantity: 0,
          revenue: 0,
          cost: 0,
          profit: 0
        };
      }
      acc[date].orderIds.add(sale.orderId);
      acc[date].quantity += sale.quantity;
      acc[date].revenue += sale.revenue;
      acc[date].cost += sale.cost;
      acc[date].profit += sale.profit;
      return acc;
    }, {} as Record<string, any>);

    // Convert daily sales to array and format
    const formattedDailySales = Object.entries(dailySales).map(([date, data]) => ({
      ...data,
      orders: data.orderIds.size,
      date: new Date(date)
    }));

    console.log('Daily sales entries:', formattedDailySales.length);

    const result = {
      sales: salesReport,
      totals: {
        totalOrders: totals.orderIds.size,
        totalQuantity: totals.totalQuantity,
        totalRevenue: totals.totalRevenue,
        totalCost: totals.totalCost,
        totalProfit: totals.totalProfit
      },
      dailySales: formattedDailySales
    };

    console.log('Successfully completed getSalesReport');
    return result;
  } catch (error) {
    console.error("Error in getSalesReport:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace available');
    return null;
  }
} 