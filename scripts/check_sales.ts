const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

interface Sale {
  id: string;
  createdAt: Date;
  productName: string;
  qty: number;
  salePrice: number;
  customerName: string;
  orderId: string;
  lineOrder: any;
}

interface LineOrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface LineOrder {
  id: string;
  createdAt: Date;
  orderNumber: string;
  customerName: string;
  orderAmount: number;
  lineOrderItems: LineOrderItem[];
  sales: Sale[];
}

async function checkOrdersAndSales() {
  try {
    // Get the last 20 orders regardless of date
    const recentOrders = await prisma.lineOrder.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        lineOrderItems: true,
        sales: true
      }
    });

    console.log(`\nLast ${recentOrders.length} Orders:`);
    
    let totalOrdersWithoutSales = 0;
    let totalOrdersWithSales = 0;
    let totalExpectedSales = 0;
    let totalActualSales = 0;

    recentOrders.forEach((order: LineOrder) => {
      const expectedSales = order.lineOrderItems.length;
      const actualSales = order.sales.length;
      totalExpectedSales += expectedSales;
      totalActualSales += actualSales;

      console.log(`\nOrder ID: ${order.id}`);
      console.log(`Order Date: ${order.createdAt}`);
      console.log(`Order Number: ${order.orderNumber}`);
      console.log(`Customer: ${order.customerName}`);
      console.log(`Order Amount: ${order.orderAmount}`);
      console.log(`Expected Sales Records: ${expectedSales}`);
      console.log(`Actual Sales Records: ${actualSales}`);
      
      if (actualSales === 0) {
        totalOrdersWithoutSales++;
        console.log('WARNING: This order has no associated sales records!');
      } else if (actualSales < expectedSales) {
        console.log('WARNING: Missing some sales records!');
        totalOrdersWithSales++;
      } else {
        totalOrdersWithSales++;
      }

      // Show order items
      console.log('\nOrder Items:');
      order.lineOrderItems.forEach((item: LineOrderItem) => {
        console.log(`- ${item.name} (Qty: ${item.qty}, Price: ${item.price})`);
      });

      // If there are sales, show them
      if (order.sales.length > 0) {
        console.log('\nAssociated Sales:');
        order.sales.forEach((sale: Sale) => {
          console.log(`- ${sale.productName} (Qty: ${sale.qty}, Price: ${sale.salePrice}, Date: ${sale.createdAt})`);
        });
      }
    });

    console.log('\nSummary:');
    console.log(`Total Orders Checked: ${recentOrders.length}`);
    console.log(`Orders with Sales Records: ${totalOrdersWithSales}`);
    console.log(`Orders without Sales Records: ${totalOrdersWithoutSales}`);
    console.log(`Total Expected Sales Records: ${totalExpectedSales}`);
    console.log(`Total Actual Sales Records: ${totalActualSales}`);
    console.log(`Missing Sales Records: ${totalExpectedSales - totalActualSales}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrdersAndSales(); 