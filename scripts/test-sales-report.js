const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getSalesReport(startDate, endDate) {
  try {
    console.log('🔍 Starting getSalesReport test...');
    
    // If no dates provided, default to current month
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    console.log('📅 Date range:', { start: start.toISOString(), end: end.toISOString() });

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
    
    console.log('📊 Total DELIVERED orders found:', orderCount);

    // Also check all orders regardless of status
    const allOrderCount = await prisma.lineOrder.count({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      }
    });
    
    console.log('📊 Total orders (all statuses):', allOrderCount);

    // Check order statuses
    const orderStatusCounts = await prisma.lineOrder.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      _count: {
        status: true
      }
    });
    
    console.log('📈 Order status breakdown:', orderStatusCounts);

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
        status: true,
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
      },
      take: 5 // Limit to first 5 for testing
    });

    console.log('📦 Orders fetched:', orders.length);
    
    if (orders.length > 0) {
      console.log('📋 Sample order details:');
      orders.forEach((order, index) => {
        const itemCount = order.lineOrderItems.length;
        const orderTotal = order.lineOrderItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
        console.log(`  ${index + 1}. Order ${order.orderNumber}:`);
        console.log(`     - ID: ${order.id}`);
        console.log(`     - Date: ${order.createdAt.toISOString()}`);
        console.log(`     - Status: ${order.status}`);
        console.log(`     - Customer: ${order.customerName || 'N/A'}`);
        console.log(`     - Items count: ${itemCount}`);
        console.log(`     - Order total: ${orderTotal}`);
        
        if (itemCount > 0) {
          console.log(`     - Sample item: ${order.lineOrderItems[0].name} (Qty: ${order.lineOrderItems[0].qty}, Price: ${order.lineOrderItems[0].price})`);
        }
      });
    } else {
      console.log('❌ No orders found with DELIVERED status');
      
      // Let's check if there are any orders with other statuses
      const sampleOrders = await prisma.lineOrder.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          createdAt: true,
          customerName: true,
          lineOrderItems: {
            select: {
              id: true,
              qty: true,
              price: true,
              name: true
            }
          }
        },
        take: 5
      });
      
      console.log('🔍 Sample orders (any status):');
      sampleOrders.forEach((order, index) => {
        console.log(`  ${index + 1}. Order ${order.orderNumber}:`);
        console.log(`     - Status: ${order.status}`);
        console.log(`     - Date: ${order.createdAt.toISOString()}`);
        console.log(`     - Items: ${order.lineOrderItems.length}`);
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

    console.log('💰 Sales report entries:', salesReport.length);
    
    if (salesReport.length > 0) {
      console.log('📈 Sample sales entries:');
      salesReport.slice(0, 3).forEach((sale, index) => {
        console.log(`  ${index + 1}. ${sale.productName}:`);
        console.log(`     - Order: ${sale.orderNumber}`);
        console.log(`     - Customer: ${sale.customerName}`);
        console.log(`     - Quantity: ${sale.quantity}`);
        console.log(`     - Unit Price: ${sale.unitPrice}`);
        console.log(`     - Revenue: ${sale.revenue}`);
        console.log(`     - Cost: ${sale.cost}`);
        console.log(`     - Profit: ${sale.profit}`);
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
      orderIds: new Set(),
      totalQuantity: 0,
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0
    });

    console.log('🏆 Calculated totals:');
    console.log(`  - Total Orders: ${totals.orderIds.size}`);
    console.log(`  - Total Quantity: ${totals.totalQuantity}`);
    console.log(`  - Total Revenue: ${totals.totalRevenue}`);
    console.log(`  - Total Cost: ${totals.totalCost}`);
    console.log(`  - Total Profit: ${totals.totalProfit}`);

    // Calculate daily sales
    const dailySales = salesReport.reduce((acc, sale) => {
      const date = sale.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date: sale.date,
          orderIds: new Set(),
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
    }, {});

    // Convert daily sales to array and format
    const formattedDailySales = Object.entries(dailySales).map(([date, data]) => ({
      ...data,
      orders: data.orderIds.size,
      date: new Date(date)
    }));

    console.log('📅 Daily sales entries:', formattedDailySales.length);
    
    if (formattedDailySales.length > 0) {
      console.log('📊 Sample daily sales:');
      formattedDailySales.slice(0, 3).forEach((day, index) => {
        console.log(`  ${index + 1}. ${day.date.toDateString()}:`);
        console.log(`     - Orders: ${day.orders}`);
        console.log(`     - Quantity: ${day.quantity}`);
        console.log(`     - Revenue: ${day.revenue}`);
        console.log(`     - Profit: ${day.profit}`);
      });
    }

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

    console.log('✅ Successfully completed getSalesReport test');
    return result;
  } catch (error) {
    console.error("❌ Error in getSalesReport:", error);
    console.error("📍 Error stack:", error instanceof Error ? error.stack : 'No stack trace available');
    return null;
  }
}

async function testExportFunctionality(data) {
  console.log('\n🧪 Testing export functionality...');
  
  if (!data || !data.sales || data.sales.length === 0) {
    console.log('❌ No sales data to export');
    return;
  }
  
  console.log('📄 Would export:');
  console.log(`  - ${data.sales.length} sales records`);
  console.log(`  - ${data.dailySales.length} daily sales entries`);
  console.log(`  - Total revenue: ${data.totals.totalRevenue}`);
  
  // Test data structure for export
  const sampleExportData = data.sales.slice(0, 3).map(sale => ({
    Date: sale.date.toLocaleDateString(),
    'Order Number': sale.orderNumber,
    Customer: sale.customerName,
    Product: sale.productName,
    Category: sale.category,
    Quantity: sale.quantity,
    'Unit Price': sale.unitPrice,
    Revenue: sale.revenue,
    Profit: sale.profit
  }));
  
  console.log('📋 Sample export data structure:');
  console.table(sampleExportData);
}

async function main() {
  try {
    console.log('🚀 Starting Sales Report Test Script\n');
    
    // Test with current month
    console.log('=== TEST 1: Current Month ===');
    const currentMonthData = await getSalesReport();
    await testExportFunctionality(currentMonthData);
    
    // Test with last month
    console.log('\n=== TEST 2: Last Month ===');
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthData = await getSalesReport(lastMonthStart, lastMonthEnd);
    await testExportFunctionality(lastMonthData);
    
    // Test with last 7 days
    console.log('\n=== TEST 3: Last 7 Days ===');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7DaysData = await getSalesReport(sevenDaysAgo, new Date());
    await testExportFunctionality(last7DaysData);
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 