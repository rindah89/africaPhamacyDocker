const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeOrderSalesDiscrepancies() {
  try {
    console.log('Starting analysis of orders and sales discrepancies...');

    // Get all orders with their sales and line items
    const orders = await prisma.lineOrder.findMany({
      include: {
        sales: true,
        lineOrderItems: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get all sales with their order information
    const sales = await prisma.sale.findMany({
      include: {
        lineOrder: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\nTotal counts:`);
    console.log(`Total orders: ${orders.length}`);
    console.log(`Total sales records: ${sales.length}`);

    // Analyze orders without sales
    const ordersWithoutSales = orders.filter(order => order.sales.length === 0);
    console.log(`\nOrders without sales records: ${ordersWithoutSales.length}`);
    if (ordersWithoutSales.length > 0) {
      console.log('\nDetails of orders without sales:');
      ordersWithoutSales.forEach(order => {
        console.log(`Order ${order.orderNumber}:`);
        console.log(`- Created at: ${order.createdAt}`);
        console.log(`- Items count: ${order.lineOrderItems.length}`);
        console.log(`- Order amount: ${order.orderAmount}`);
        console.log(`- Amount paid: ${order.amountPaid}`);
        console.log('---');
      });
    }

    // Analyze sales without valid orders
    const salesWithoutValidOrders = sales.filter(sale => !sale.lineOrder);
    console.log(`\nSales without valid orders: ${salesWithoutValidOrders.length}`);
    if (salesWithoutValidOrders.length > 0) {
      console.log('\nDetails of sales without valid orders:');
      salesWithoutValidOrders.forEach(sale => {
        console.log(`Sale for product "${sale.productName}":`);
        console.log(`- Created at: ${sale.createdAt}`);
        console.log(`- Amount: ${sale.salePrice * sale.qty}`);
        console.log(`- Order ID: ${sale.orderId}`);
        console.log('---');
      });
    }

    // Analyze amount discrepancies
    const ordersWithAmountDiscrepancies = orders.filter(order => {
      if (order.sales.length === 0) return false;
      
      // Calculate total from sales
      const salesTotal = order.sales.reduce((sum, sale) => sum + (sale.salePrice * sale.qty), 0);
      
      // Calculate total from line items
      const lineItemsTotal = order.lineOrderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
      
      // Check if there's a significant difference (using 0.01 to handle floating point)
      return Math.abs(salesTotal - lineItemsTotal) > 0.01;
    });

    console.log(`\nOrders with amount discrepancies: ${ordersWithAmountDiscrepancies.length}`);
    if (ordersWithAmountDiscrepancies.length > 0) {
      console.log('\nDetails of orders with amount discrepancies:');
      ordersWithAmountDiscrepancies.forEach(order => {
        const salesTotal = order.sales.reduce((sum, sale) => sum + (sale.salePrice * sale.qty), 0);
        const lineItemsTotal = order.lineOrderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        console.log(`Order ${order.orderNumber}:`);
        console.log(`- Created at: ${order.createdAt}`);
        console.log(`- Line items total: ${lineItemsTotal}`);
        console.log(`- Sales total: ${salesTotal}`);
        console.log(`- Difference: ${Math.abs(salesTotal - lineItemsTotal)}`);
        console.log('---');
      });
    }

    // Additional statistics
    console.log('\nAdditional Statistics:');
    console.log(`Orders with null amountPaid: ${orders.filter(o => o.amountPaid === null).length}`);
    console.log(`Orders with null orderAmount: ${orders.filter(o => o.orderAmount === null).length}`);

  } catch (error) {
    console.error('Error during analysis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
console.log('Starting analysis process...');
analyzeOrderSalesDiscrepancies()
  .then(() => console.log('Analysis completed'))
  .catch(error => console.error('Analysis failed:', error)); 