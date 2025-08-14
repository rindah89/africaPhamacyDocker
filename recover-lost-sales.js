const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function recoverLostSales() {
  try {
    console.log('🔄 Lost Sales Recovery Tool\n');
    
    // Get products that had stock changes today
    const today = new Date('2025-08-14');
    const productsWithChanges = await prisma.product.findMany({
      where: {
        updatedAt: {
          gte: today
        }
      },
      select: {
        id: true,
        name: true,
        stockQty: true,
        price: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log('Products with stock changes today:');
    productsWithChanges.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Current stock: ${product.stockQty} units`);
      console.log(`   Price: ${product.price} FCFA`);
      console.log(`   Last updated: ${product.updatedAt.toLocaleString()}\n`);
    });
    
    const recover = await question('\nDo you want to create recovery orders based on staff input? (yes/no): ');
    
    if (recover.toLowerCase() !== 'yes') {
      console.log('Recovery cancelled.');
      rl.close();
      return;
    }
    
    // Get cash register total for the day
    const cashTotal = await question('\nWhat is the total cash amount from the register for today? (FCFA): ');
    console.log(`Cash register total: ${cashTotal} FCFA`);
    
    // Get staff recall of sales
    console.log('\n📝 Please provide details of sales you remember from today:');
    console.log('(Enter "done" when finished)\n');
    
    const recoveredSales = [];
    let saleIndex = 1;
    
    while (true) {
      console.log(`\n--- Sale #${saleIndex} ---`);
      const productName = await question('Product name (or "done" to finish): ');
      
      if (productName.toLowerCase() === 'done') break;
      
      // Search for the product
      const product = await prisma.product.findFirst({
        where: {
          name: {
            contains: productName,
            mode: 'insensitive'
          }
        }
      });
      
      if (!product) {
        console.log('❌ Product not found. Please try again.');
        continue;
      }
      
      console.log(`✅ Found: ${product.name} (${product.price} FCFA per unit)`);
      
      const quantity = await question('Quantity sold: ');
      const customerName = await question('Customer name (or "Walk-in Customer"): ') || 'Walk-in Customer';
      const paymentMethod = await question('Payment method (CASH/MOMO/ORANGE/NONE): ') || 'CASH';
      
      recoveredSales.push({
        product,
        quantity: parseInt(quantity),
        customerName,
        paymentMethod,
        total: product.price * parseInt(quantity)
      });
      
      console.log(`✅ Added: ${product.name} x${quantity} = ${product.price * parseInt(quantity)} FCFA`);
      saleIndex++;
    }
    
    // Show summary
    console.log('\n📊 RECOVERY SUMMARY:');
    console.log('===================');
    let totalAmount = 0;
    recoveredSales.forEach((sale, index) => {
      console.log(`${index + 1}. ${sale.product.name} x${sale.quantity} = ${sale.total} FCFA (${sale.customerName})`);
      totalAmount += sale.total;
    });
    console.log(`\nTotal recovered: ${totalAmount} FCFA`);
    console.log(`Cash register: ${cashTotal} FCFA`);
    console.log(`Difference: ${parseInt(cashTotal) - totalAmount} FCFA`);
    
    const confirm = await question('\nCreate these recovery orders? (yes/no): ');
    
    if (confirm.toLowerCase() === 'yes') {
      console.log('\n🔄 Creating recovery orders...');
      
      for (const sale of recoveredSales) {
        try {
          // Create the order
          const orderNumber = `RECOVERY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          
          const order = await prisma.lineOrder.create({
            data: {
              orderNumber,
              customerId: '6708677a078944327c4629e5', // Walk-in Customer ID
              customerName: sale.customerName,
              orderAmount: sale.total,
              amountPaid: sale.total,
              orderType: 'sale',
              source: 'recovery',
              status: 'DELIVERED',
              paymentMethod: sale.paymentMethod,
              lineOrderItems: {
                create: {
                  productId: sale.product.id,
                  name: sale.product.name,
                  qty: sale.quantity,
                  price: sale.product.price,
                  productThumbnail: ''
                }
              }
            }
          });
          
          // Create corresponding sale record
          await prisma.sale.create({
            data: {
              orderId: order.id,
              orderNumber: order.orderNumber,
              productId: sale.product.id,
              productName: sale.product.name,
              qty: sale.quantity,
              salePrice: sale.product.price,
              total: sale.total,
              productImage: '',
              customerName: sale.customerName,
              paymentMethod: sale.paymentMethod
            }
          });
          
          console.log(`✅ Created order ${order.orderNumber} for ${sale.product.name}`);
          
        } catch (error) {
          console.error(`❌ Failed to create order for ${sale.product.name}:`, error.message);
        }
      }
      
      console.log('\n✅ Recovery complete!');
      console.log('Note: Stock levels were already updated when the original sales were made.');
      console.log('These recovery orders are for record-keeping purposes.');
    }
    
    rl.close();
    
  } catch (error) {
    console.error('Error:', error);
    rl.close();
  } finally {
    await prisma.$disconnect();
  }
}

recoverLostSales();