"use server";

import prisma from "@/lib/db";
import { withCache, cacheKeys } from "@/lib/cache";
import { revalidatePath } from "next/cache";
import { OrderLineItem } from "@/redux/slices/pointOfSale";
import { NotificationStatus, Prisma, PrismaClient, Product, LineOrder } from "@prisma/client";
import { generateOrderNumber } from "@/lib/generateOrderNumbers";
import { ILineOrder } from "@/types/types";

// Define the PaymentMethod type based on the Prisma schema
type PaymentMethod = Prisma.LineOrderCreateInput['paymentMethod']

interface CustomerData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  streetAddress?: string;
  apartment?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  method?: PaymentMethod;
}

interface OrderData {
  orderItems: OrderLineItem[];
  orderAmount: number;
  orderType: string;
  source: string;
}

type NotificationProps = {
  message: string;
  status?: NotificationStatus;
  statusText: string;
};

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'> & {
  sale: PrismaClient['sale']
};

export async function createNotification(data: NotificationProps) {
  try {
    const newNot = await prisma.notification.create({
      data,
    });
    revalidatePath("/dashboard");
    return newNot;
  } catch (error) {
    console.log(error);
  }
}

export async function updateNotificationStatusById(id: string) {
  try {
    const updatedNot = await prisma.notification.update({
      where: {
        id,
      },
      data: {
        read: true,
      },
    });
    revalidatePath("/dashboard");
    return updatedNot;
  } catch (error) {
    console.log(error);
  }
}

export async function getNotifications() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        read: false,
      },
    });
    return notifications;
  } catch (error) {
    console.log(error);
  }
}

// Step 1: Validate and prepare order
export async function validateOrder(orderData: OrderData, customerData: CustomerData) {
  try {
    // Validate customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerData.customerId },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Validate all products and their quantities
    for (const item of orderData.orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        include: { batches: true },
      });

      if (!product) {
        throw new Error(`Product ${item.name} not found`);
      }

      if (product.stockQty < item.qty) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
    }

    // Generate order number
    const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();

    return {
      success: true,
      orderNumber,
      message: "Order validated successfully"
    };
  } catch (error: any) {
    console.error("Order validation error:", error);
    return {
      success: false,
      message: error.message || "Failed to validate order"
    };
  }
}

// Step 2: Process payment and create order
export async function processPaymentAndOrder(
  orderData: OrderData, 
  customerData: CustomerData,
  orderNumber: string,
  amountPaid: number,
  insuranceData?: {
    providerId: string;
    providerName: string;
    percentage: number;
    insuranceAmount: number;
    customerAmount: number;
    customerName: string;
    policyNumber: string;
  } | null
) {
  console.log('🚀 Starting processPaymentAndOrder:', {
    orderNumber,
    amountPaid,
    customerName: customerData.customerName,
    itemCount: orderData.orderItems.length,
    totalAmount: orderData.orderAmount,
    hasInsurance: !!insuranceData
  });

  try {
    // Use transaction to ensure all operations succeed or fail together
    const order = await prisma.$transaction(async (tx) => {
      console.log('📦 Creating order in transaction');
      
      // Create order and line items
      const newOrder = await tx.lineOrder.create({
        data: {
          orderNumber,
          orderType: orderData.orderType,
          source: orderData.source,
          orderAmount: Math.round(orderData.orderAmount),
          amountPaid: Math.round(amountPaid),
          customerId: customerData.customerId,
          customerName: customerData.customerName || 'Walk-in Customer',
          customerEmail: customerData.customerEmail || customerData.email || null,
          paymentMethod: insuranceData ? 'INSURANCE' : customerData.method ?? 'NONE',
          // Insurance fields (will be updated after claim creation)
          insuranceAmount: insuranceData?.insuranceAmount || null,
          customerPaidAmount: insuranceData?.customerAmount || null,
          insurancePercentage: insuranceData?.percentage || null,
          insuranceProviderName: insuranceData?.providerName || null,
          insurancePolicyNumber: insuranceData?.policyNumber || null,
          lineOrderItems: {
            create: orderData.orderItems.map(item => ({
              productId: item.id,
              name: item.name,
              qty: item.qty,
              price: item.price,
              productThumbnail: item.productThumbnail
            }))
          }
        },
        include: {
          lineOrderItems: true
        }
      });

      console.log('✅ Order created successfully:', {
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        itemCount: newOrder.lineOrderItems.length
      });

      // Create insurance claim first if insurance data is provided
      let createdClaim = null;
      if (insuranceData) {
        console.log('🏥 Creating insurance claim');
        
        // Generate claim number
        const claimNumber = `CLM-${Date.now()}`;
        
        createdClaim = await tx.insuranceClaim.create({
          data: {
            claimNumber,
            orderNumber: newOrder.orderNumber,
            customerName: insuranceData.customerName,
            policyNumber: insuranceData.policyNumber,
            totalAmount: orderData.orderAmount,
            insurancePercentage: insuranceData.percentage,
            insuranceAmount: insuranceData.insuranceAmount,
            customerAmount: insuranceData.customerAmount,
            providerId: insuranceData.providerId,
            claimItems: {
              create: orderData.orderItems.map(item => ({
                productName: item.name,
                quantity: item.qty,
                unitPrice: item.price,
                totalPrice: item.price * item.qty
              }))
            }
          },
          include: {
            provider: true,
            claimItems: true
          }
        });

        console.log('✅ Insurance claim created:', {
          claimId: createdClaim.id,
          claimNumber: createdClaim.claimNumber,
          providerName: insuranceData.providerName,
          insuranceAmount: insuranceData.insuranceAmount
        });

        // Update the order with the insurance claim ID
        await tx.lineOrder.update({
          where: { id: newOrder.id },
          data: { insuranceClaimId: createdClaim.id }
        });

        console.log('✅ Order updated with insurance claim ID:', {
          orderId: newOrder.id,
          claimId: createdClaim.id
        });
      }

      // Process each order item
      for (const item of orderData.orderItems) {
        console.log(`📝 Processing order item: ${item.name}`);
        
        // Get available batches ordered by expiry date (FIFO)
        const batches = await tx.productBatch.findMany({
          where: {
            productId: item.id,
            status: true,
            quantity: { gt: 0 }
          },
          orderBy: { expiryDate: 'asc' }
        });

        console.log(`Found ${batches.length} active batches for ${item.name}`);

        let remainingQty = item.qty;
        // Deduct quantities from batches
        for (const batch of batches) {
          if (remainingQty <= 0) break;

          const deductionQty = Math.min(batch.quantity, remainingQty);
          await tx.productBatch.update({
            where: { id: batch.id },
            data: { quantity: { decrement: deductionQty } }
          });
          remainingQty -= deductionQty;
          
          console.log(`Updated batch ${batch.id}: deducted ${deductionQty} units`);
        }

        // Update product's total stock quantity
        await tx.product.update({
          where: { id: item.id },
          data: { stockQty: { decrement: item.qty } }
        });

        // Calculate insurance amounts per item (proportional to item price)
        const itemTotal = item.price * item.qty;
        const itemInsuranceAmount = insuranceData 
          ? (itemTotal * insuranceData.percentage) / 100 
          : null;
        const itemCustomerAmount = insuranceData 
          ? itemTotal - itemInsuranceAmount 
          : null;

        // Create sale record with insurance data if applicable
        await tx.sale.create({
          data: {
            orderId: newOrder.id,
            orderNumber: newOrder.orderNumber,
            productId: item.id,
            qty: item.qty,
            salePrice: item.price,
            total: itemTotal,
            productName: item.name,
            productImage: item.productThumbnail || '',
            customerName: customerData.customerName || 'Walk-in Customer',
            customerEmail: customerData.customerEmail || customerData.email || null,
            paymentMethod: insuranceData ? 'INSURANCE' : customerData.method ?? 'NONE',
            // Insurance fields (null if no insurance)
            insuranceClaimId: createdClaim?.id || null,
            insuranceAmount: itemInsuranceAmount,
            customerPaidAmount: itemCustomerAmount,
            insurancePercentage: insuranceData?.percentage || null,
          }
        });

        console.log(`Created sale record for ${item.name}`, {
          hasInsurance: !!insuranceData,
          itemInsuranceAmount,
          itemCustomerAmount
        });

        // Check if stock is below alert quantity
        const updatedProduct = await tx.product.findUnique({
          where: { id: item.id }
        });

        if (updatedProduct && updatedProduct.stockQty <= updatedProduct.alertQty) {
          await createNotification({
            message: updatedProduct.stockQty === 0
              ? `The stock of ${updatedProduct.name} is out. Current stock: ${updatedProduct.stockQty}.`
              : `The stock of ${updatedProduct.name} has gone below threshold. Current stock: ${updatedProduct.stockQty}.`,
            status: updatedProduct.stockQty === 0 ? "DANGER" : "WARNING",
            statusText: updatedProduct.stockQty === 0 ? "Stock Out" : "Warning",
          });
        }
      }

      return newOrder;
    });

    console.log('🎉 Order processing completed successfully:', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      hasInsurance: !!insuranceData
    });

    revalidatePath("/pos");
    revalidatePath("/dashboard/insurance-partners");
    return { success: true, order };
  } catch (error: any) {
    console.error("❌ Order creation error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return {
      success: false,
      message: error.message || "Failed to create order"
    };
  }
}

export async function createLineOrder(
  newOrder: OrderData,
  customerData: CustomerData
) {
  const { orderItems, orderAmount, orderType, source } = newOrder;
  try {
    console.log('Starting order creation process...');
    
    // Pre-check available batches
    console.log('Checking batch quantities...');
    const batchChecks = await Promise.all(orderItems.map(async (item) => {
      const availableBatches = await prisma.productBatch.findMany({
        where: {
          productId: item.id,
          status: true,
          quantity: { gt: 0 }
        },
        orderBy: { expiryDate: 'asc' }
      });

      const availableQty = availableBatches.reduce((sum: number, batch: { quantity: number }) => sum + batch.quantity, 0);
      if (availableQty < item.qty) {
        throw new Error(`Insufficient batch quantity for product: ${item.name}`);
      }
      return { item, availableBatches };
    }));

    // Get the customer email from either customerEmail or email field
    const customerEmail = customerData.customerEmail || customerData.email || null;

    // Create the base order first
    const lineOrder = await prisma.lineOrder.create({
      data: {
        customerId: customerData.customerId,
        customerName: customerData.customerName || 'Walk-in Customer',
        customerEmail,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        email: customerData.email,
        streetAddress: customerData.streetAddress,
        apartment: customerData.apartment,
        city: customerData.city,
        state: customerData.state,
        zipCode: customerData.zipCode,
        country: customerData.country,
        paymentMethod: customerData.method ?? 'NONE' as PaymentMethod,
        orderNumber: generateOrderNumber(),
        orderAmount: Math.round(orderAmount), // Convert to integer as per schema
        orderType,
        source,
        status: source === "pos" ? "PENDING" : "PROCESSING",
      }
    });

    // Process items in chunks
    const CHUNK_SIZE = 5;
    for (let i = 0; i < batchChecks.length; i += CHUNK_SIZE) {
      const chunk = batchChecks.slice(i, i + CHUNK_SIZE);
      
      await prisma.$transaction(async (tx: TransactionClient) => {
        for (const { item, availableBatches } of chunk) {
          let remainingQty = item.qty;
          
          // Update batches
          for (const batch of availableBatches) {
            if (remainingQty <= 0) break;
            const deductionQty = Math.min(batch.quantity, remainingQty);
            await tx.productBatch.update({
              where: { id: batch.id },
              data: { quantity: { decrement: deductionQty } }
            });
            remainingQty -= deductionQty;
          }

          // Update product stock
          await tx.product.update({
            where: { id: item.id },
            data: { stockQty: { decrement: item.qty } }
          });

          // Create line order item
          await tx.lineOrderItem.create({
            data: {
              orderId: lineOrder.id,
              productId: item.id,
              name: item.name,
              price: item.price,
              qty: item.qty,
              productThumbnail: item.productThumbnail,
            }
          });

          // Create sale record with all required fields
          await tx.sale.create({
            data: {
              orderId: lineOrder.id,
              orderNumber: lineOrder.orderNumber,
              productId: item.id,
              qty: item.qty,
              salePrice: item.price,
              total: item.price * item.qty,
              productName: item.name,
              productImage: item.productThumbnail || '',
              customerName: customerData.customerName || 'Walk-in Customer',
              customerEmail, // Use the same email value as the order
              paymentMethod: customerData.method ?? 'NONE'
            }
          });
        }
      });
    }

    // Handle notifications outside of transactions
    const updatedProducts = await prisma.product.findMany({
      where: { id: { in: orderItems.map(item => item.id) } }
    });

    for (const product of updatedProducts) {
      if (product.stockQty < product.alertQty) {
        const message = product.stockQty === 0
          ? `The stock of ${product.name} is out. Current stock: ${product.stockQty}.`
          : `The stock of ${product.name} has gone below threshold. Current stock: ${product.stockQty}.`;
        await createNotification({
          message,
          status: product.stockQty === 0 ? "DANGER" : "WARNING",
          statusText: product.stockQty === 0 ? "Stock Out" : "Warning",
        });
      }
    }

    revalidatePath("/dashboard/sales");

    const savedLineOrder = await prisma.lineOrder.findUnique({
      where: { id: lineOrder.id },
      include: { lineOrderItems: true },
    });

    return savedLineOrder;
  } catch (error) {
    console.error("Transaction error:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

export async function getOrders() {
  try {
    // Use a more efficient query without nested aggregation
    const allOrders = await prisma.lineOrder.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Reduced from 100 for better performance
      select: {
        id: true,
        ordernumber: true,
        createdAt: true,
        total: true,
        customerId: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        lineOrderItems: {
          take: 3, // Reduced from 5 for better performance
          select: {
            id: true,
            productId: true,
            name: true,
            qty: true,
            price: true,
            productThumbnail: true,
          }
        },
      },
    });
    
    // Filter out orders with no line items after the fact (more efficient than nested query)
    const ordersWithItems = allOrders.filter(order => order.lineOrderItems.length > 0);
    
    return ordersWithItems;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

export async function getRecentOrdersForDashboard(count: number = 5) {
  return withCache(cacheKeys.recentOrdersDashboard(count), async () => {
    try {
      // Use a more efficient query without nested aggregation
      const orders = await prisma.lineOrder.findMany({
        orderBy: { createdAt: "desc" },
        take: Math.min(count * 2, 20), // Fetch extra to account for filtering
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          total: true,
          customerName: true,
          customerEmail: true,
          lineOrderItems: {
            take: 2, // Limit line items per order for performance
            select: {
              id: true,
              name: true,
              qty: true,
              price: true
            }
          }
        }
      });
      
      // Filter and limit after fetching (more efficient than nested where)
      const ordersWithItems = orders
        .filter(order => order.lineOrderItems.length > 0)
        .slice(0, count);
      
      // Ensure lineOrderItems is always present (even if empty)
      return ordersWithItems.map(order => ({
        ...order,
        lineOrderItems: order.lineOrderItems || []
      }));
    } catch (error) {
      console.error("Error fetching recent orders for dashboard:", error);
      // Return empty array as fallback to prevent UI breaking
      return [];
    }
  }, 5 * 60 * 1000);
}

// Get all orders without filtering (for debugging)
export async function getAllOrdersNoFilter() {
  try {
    const allOrders = await prisma.lineOrder.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      include: {
        lineOrderItems: true,
      },
    });
    return allOrders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

// Simple fallback orders fetching for when the main function times out
export async function getAllOrdersSimple(page = 1, limit = 20) {
  console.log(`🔄 getAllOrdersSimple: Starting two-step query - page=${page}, limit=${limit}`);
  const functionStartTime = Date.now();
  
  try {
    const skip = (page - 1) * limit;
    
    // Step 1: Get orders without relations (should be fast)
    console.log(`🔄 getAllOrdersSimple: Step 1 - Getting orders without relations`);
    const ordersStartTime = Date.now();
    
    const orders = await prisma.lineOrder.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        // Core fields only - no relations
        id: true,
        customerId: true,
        customerName: true,
        orderNumber: true,
        customerEmail: true,
        orderAmount: true,
        amountPaid: true,
        orderType: true,
        source: true,
        status: true,
        paymentMethod: true,
        
        // ECOMMERCE Personal Details
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        
        // ECOMMERCE Shipping Details
        streetAddress: true,
        apartment: true,
        city: true,
        state: true,
        country: true,
        zipCode: true,

        // Insurance-related fields
        insuranceClaimId: true,
        insuranceAmount: true,
        customerPaidAmount: true,
        insurancePercentage: true,
        insuranceProviderName: true,
        insurancePolicyNumber: true,
        
        // Timestamps
        createdAt: true,
        updatedAt: true,
      },
    });

    const ordersTime = Date.now() - ordersStartTime;
    console.log(`✅ getAllOrdersSimple: Step 1 completed in ${ordersTime}ms - ${orders.length} orders`);

    if (orders.length === 0) {
      console.log(`⚠️ getAllOrdersSimple: No orders found for page ${page}`);
      return {
        orders: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page
      };
    }

    // Step 2: Get line items for these specific orders
    console.log(`🔄 getAllOrdersSimple: Step 2 - Getting line items for ${orders.length} orders`);
    const itemsStartTime = Date.now();
    
    const orderIds = orders.map(order => order.id);
    const lineItems = await prisma.lineOrderItem.findMany({
      where: {
        orderId: { in: orderIds }
      },
      select: {
        id: true,
        orderId: true,
        productId: true,
        name: true,
        qty: true,
        price: true,
        productThumbnail: true,
      },
      take: limit * 5 // Limit total items to prevent huge queries
    });

    const itemsTime = Date.now() - itemsStartTime;
    console.log(`✅ getAllOrdersSimple: Step 2 completed in ${itemsTime}ms - ${lineItems.length} line items`);

    // Step 3: Combine orders with their line items
    console.log(`🔄 getAllOrdersSimple: Step 3 - Combining data`);
    const combineStartTime = Date.now();
    
    const ordersWithItems = orders.map(order => ({
      ...order,
      lineOrderItems: lineItems.filter(item => item.orderId === order.id)
    }));

    // Filter to only include orders that have line items
    const ordersWithLineItems = ordersWithItems.filter(order => order.lineOrderItems.length > 0);
    
    const combineTime = Date.now() - combineStartTime;
    console.log(`✅ getAllOrdersSimple: Step 3 completed in ${combineTime}ms`);
    console.log(`📊 getAllOrdersSimple: Filtered to ${ordersWithLineItems.length} orders with line items`);

    // Step 4: Get simple total count (without expensive relation filter)
    console.log(`🔄 getAllOrdersSimple: Step 4 - Getting total count`);
    const countStartTime = Date.now();
    
    const totalCount = await prisma.lineOrder.count();
    const countTime = Date.now() - countStartTime;
    console.log(`✅ getAllOrdersSimple: Step 4 completed in ${countTime}ms - total: ${totalCount}`);
    
    const result = {
      orders: ordersWithLineItems,
      totalCount: Math.round(totalCount * 0.8), // Estimate 80% have line items
      totalPages: Math.ceil((totalCount * 0.8) / limit),
      currentPage: page
    };

    const totalTime = Date.now() - functionStartTime;
    console.log(`✅ getAllOrdersSimple: Completed in ${totalTime}ms with ${ordersWithLineItems.length} orders`);
    console.log(`📊 getAllOrdersSimple: Performance breakdown:`);
    console.log(`   - Orders query: ${ordersTime}ms`);
    console.log(`   - Line items query: ${itemsTime}ms`);
    console.log(`   - Data combination: ${combineTime}ms`);
    console.log(`   - Count query: ${countTime}ms`);
    console.log(`   - Total: ${totalTime}ms`);
    
    return result;
  } catch (error) {
    const errorTime = Date.now() - functionStartTime;
    console.error(`❌ getAllOrdersSimple: Failed after ${errorTime}ms:`, error);
    
    // Return empty result instead of throwing
    return {
      orders: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page
    };
  }
}

// Optimized orders fetching with pagination
export async function getAllOrdersPaginated(page = 1, limit = 20) {
  return withCache(cacheKeys.orders(page, limit), async () => {
    try {
      const skip = (page - 1) * limit;
      
      // Step 1: Get orders WITHOUT expensive relation filter (avoids MongoDB timeout)
      const orders = await prisma.lineOrder.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          // Core fields
          id: true,
          customerId: true,
          customerName: true,
          orderNumber: true,
          customerEmail: true, 
          
          // Order details
          orderAmount: true,
          amountPaid: true,
          orderType: true,
          source: true,
          status: true,
          paymentMethod: true,

          // ECOMMERCE Personal Details
          firstName: true,
          lastName: true,
          email: true, 
          phone: true,
          
          // ECOMMERCE Shipping Details
          streetAddress: true,
          apartment: true,
          city: true,
          state: true,
          country: true,
          zipCode: true,

          // Insurance-related fields
          insuranceClaimId: true,
          insuranceAmount: true,
          customerPaidAmount: true,
          insurancePercentage: true,
          insuranceProviderName: true,
          insurancePolicyNumber: true,
          
          // Timestamps
          createdAt: true,
          updatedAt: true,
        },
      });

      if (orders.length === 0) {
        return {
          orders: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: page
        };
      }

      // Step 2: Get line items for these specific orders (targeted query)
      const orderIds = orders.map(order => order.id);
      const lineItems = await prisma.lineOrderItem.findMany({
        where: {
          orderId: { in: orderIds }
        },
        select: {
          id: true,
          orderId: true,
          productId: true,
          name: true,
          qty: true,
          price: true,
          productThumbnail: true,
        },
        take: limit * 5 // Limit total items to prevent huge queries
      });

      // Step 3: Combine orders with their line items (in-memory operation)
      const ordersWithItems = orders.map(order => ({
        ...order,
        lineOrderItems: lineItems.filter(item => item.orderId === order.id)
      }));

      // Filter to only include orders that have line items
      const ordersWithLineItems = ordersWithItems.filter(order => order.lineOrderItems.length > 0);
      
      // Step 4: Get total count
      const totalOrdersCount = await prisma.lineOrder.count();
      
      // Estimate orders with line items based on current results
      const estimatedPercentageWithItems = orders.length > 0 ? (ordersWithLineItems.length / orders.length) : 0.85;
      const totalCount = Math.round(totalOrdersCount * estimatedPercentageWithItems);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        orders: ordersWithLineItems,
        totalCount,
        totalPages,
        currentPage: page
      };

    } catch (error) {
      // Check if it's a timeout error and try fallback
      if (error instanceof Error && error.message.includes('MaxTimeMSExpired')) {
        try {
          // Simple fallback query without relation filtering
          const fallbackOrders = await prisma.lineOrder.findMany({
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              orderNumber: true,
              customerName: true,
              orderAmount: true,
              status: true,
              createdAt: true,
              lineOrderItems: {
                select: {
                  id: true,
                  name: true,
                  qty: true,
                  price: true,
                  productThumbnail: true,
                },
                take: 5
              }
            }
          });
          
          const ordersWithItemsFallback = fallbackOrders.filter(order => order.lineOrderItems.length > 0);
          const totalCountFallback = await prisma.lineOrder.count();
          
          return {
            orders: ordersWithItemsFallback,
            totalCount: Math.round(totalCountFallback * 0.9), // Estimate 90% have line items
            totalPages: Math.ceil((totalCountFallback * 0.9) / limit),
            currentPage: page
          };
        } catch (fallbackError) {
          console.error('Orders query failed with fallback:', fallbackError);
        }
      }
      
      console.error('Failed to fetch orders:', error);
      return null;
    }
  }, 3 * 60 * 1000); // Cache for 3 minutes
}

// Optimized orders fetching for minimal data (for dropdowns, etc.)
export async function getOrdersMinimal(page = 1, limit = 10) {
  return withCache(cacheKeys.ordersMinimal(page, limit), async () => {
    try {
      const skip = (page - 1) * limit;
      
      const orders = await prisma.lineOrder.findMany({
        where: {
          lineOrderItems: {
            some: {}
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          status: true,
          orderAmount: true,
          createdAt: true,
          _count: {
            select: {
              lineOrderItems: true
            }
          }
        },
      });

      return orders;
    } catch (error) {
      console.log(error);
      return null;
    }
  }, 5 * 60 * 1000); // Cache for 5 minutes
}

// Database diagnostic functions for investigating the orders issue
export async function diagnoseDatabaseStructure() {
  console.log("🔍 Starting database structure diagnosis...");
  
  try {
    // 1. Get basic counts
    console.log("📊 Getting basic counts...");
    const [totalOrders, totalLineOrderItems] = await Promise.all([
      prisma.lineOrder.count(),
      prisma.lineOrderItem.count()
    ]);
    
    console.log(`📊 Database Overview:`);
    console.log(`   - Total Orders: ${totalOrders}`);
    console.log(`   - Total Line Items: ${totalLineOrderItems}`);
    console.log(`   - Average Items per Order: ${(totalLineOrderItems / totalOrders).toFixed(2)}`);

    // 2. Check recent orders without relations
    console.log("📊 Checking recent orders (no relations)...");
    const recentOrdersBasic = await prisma.lineOrder.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        orderAmount: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log(`📊 Recent Orders (Basic):`, recentOrdersBasic);

    // 3. Check if any orders have line items using aggregation
    console.log("📊 Checking orders with line items using aggregation...");
    
    // Get orders that have line items by checking line items collection
    const ordersWithItems = await prisma.lineOrderItem.groupBy({
      by: ['orderId'],
      _count: {
        id: true
      },
      take: 10
    });
    
    console.log(`📊 Sample Orders with Line Items:`, ordersWithItems.slice(0, 5));

    // 4. Check line items for recent orders
    if (recentOrdersBasic.length > 0) {
      console.log("📊 Checking line items for recent orders...");
      const recentOrderIds = recentOrdersBasic.map(order => order.id);
      
      const lineItemsForRecentOrders = await prisma.lineOrderItem.findMany({
        where: {
          orderId: { in: recentOrderIds }
        },
        select: {
          id: true,
          orderId: true,
          name: true,
          qty: true,
          price: true
        }
      });
      
      console.log(`📊 Line Items for Recent Orders:`, lineItemsForRecentOrders);
      
      // Group by order
      const itemsByOrder = lineItemsForRecentOrders.reduce((acc, item) => {
        if (!acc[item.orderId]) acc[item.orderId] = [];
        acc[item.orderId].push(item);
        return acc;
      }, {} as Record<string, any[]>);
      
      console.log(`📊 Items grouped by Order ID:`, itemsByOrder);
    }

    // 5. Check for orders without line items
    console.log("📊 Looking for orders without line items...");
    const allOrderIds = recentOrdersBasic.map(order => order.id);
    const orderIdsWithItems = ordersWithItems.map(item => item.orderId);
    const ordersWithoutItems = allOrderIds.filter(id => !orderIdsWithItems.includes(id));
    
    console.log(`📊 Orders without items: ${ordersWithoutItems.length}/${allOrderIds.length}`);

    // 6. Try to understand the performance issue
    console.log("📊 Performance analysis...");
    const startTime = Date.now();
    
    try {
      // Try a very simple query first
      const simpleQuery = await prisma.lineOrder.findMany({
        take: 1,
        select: { id: true, orderNumber: true }
      });
      const simpleTime = Date.now() - startTime;
      console.log(`✅ Simple query (1 order, 2 fields): ${simpleTime}ms`);
      
      // Try with more fields
      const startTime2 = Date.now();
      const mediumQuery = await prisma.lineOrder.findMany({
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          orderAmount: true,
          status: true,
          createdAt: true
        }
      });
      const mediumTime = Date.now() - startTime2;
      console.log(`✅ Medium query (5 orders, 6 fields): ${mediumTime}ms`);
      
    } catch (perfError) {
      console.error(`❌ Performance test failed:`, perfError);
    }

    return {
      totalOrders,
      totalLineOrderItems,
      averageItemsPerOrder: totalLineOrderItems / totalOrders,
      recentOrders: recentOrdersBasic,
      ordersWithItemsCount: ordersWithItems.length,
      diagnosis: "completed"
    };

  } catch (error) {
    console.error("❌ Database diagnosis failed:", error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

// Test different query strategies
export async function testQueryStrategies() {
  console.log("🧪 Testing different query strategies...");
  
  const strategies = [
    {
      name: "Strategy 1: No relations, basic fields only",
      query: async () => {
        return await prisma.lineOrder.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            orderAmount: true,
            status: true,
            createdAt: true
          }
        });
      }
    },
    {
      name: "Strategy 2: Two-step approach - orders first, then items",
      query: async () => {
        // Step 1: Get orders
        const orders = await prisma.lineOrder.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            orderAmount: true,
            status: true,
            createdAt: true
          }
        });
        
        // Step 2: Get line items for these orders
        const orderIds = orders.map(o => o.id);
        const lineItems = await prisma.lineOrderItem.findMany({
          where: { orderId: { in: orderIds } },
          select: {
            id: true,
            orderId: true,
            name: true,
            qty: true,
            price: true,
            productThumbnail: true
          }
        });
        
        // Step 3: Combine the data
        const ordersWithItems = orders.map(order => ({
          ...order,
          lineOrderItems: lineItems.filter(item => item.orderId === order.id)
        }));
        
        return ordersWithItems;
      }
    },
    {
      name: "Strategy 3: Line items first approach",
      query: async () => {
        // Get recent line items and their orders
        const recentItems = await prisma.lineOrderItem.findMany({
          take: 50, // Get more items to ensure we get enough unique orders
          orderBy: { createdAt: "desc" },
          select: {
            orderId: true,
            name: true,
            qty: true,
            price: true,
            productThumbnail: true,
            lineOrder: {
              select: {
                id: true,
                orderNumber: true,
                customerName: true,
                orderAmount: true,
                status: true,
                createdAt: true
              }
            }
          }
        });
        
        // Group by order and limit to 10 orders
        const orderMap = new Map();
        recentItems.forEach(item => {
          const orderId = item.orderId;
          if (!orderMap.has(orderId) && orderMap.size < 10) {
            orderMap.set(orderId, {
              ...item.lineOrder,
              lineOrderItems: []
            });
          }
          if (orderMap.has(orderId)) {
            orderMap.get(orderId).lineOrderItems.push({
              id: item.orderId, // This would need the actual item ID
              name: item.name,
              qty: item.qty,
              price: item.price,
              productThumbnail: item.productThumbnail
            });
          }
        });
        
        return Array.from(orderMap.values());
      }
    }
  ];

  const results = [];
  
  for (const strategy of strategies) {
    console.log(`🧪 Testing: ${strategy.name}`);
    const startTime = Date.now();
    
    try {
      const result = await strategy.query();
      const duration = Date.now() - startTime;
      const success = true;
      
      console.log(`✅ ${strategy.name}: ${duration}ms - ${result.length} orders`);
      if (result.length > 0) {
        console.log(`   Sample: ${result[0].orderNumber} - ${result[0].lineOrderItems?.length || 0} items`);
      }
      
      results.push({
        name: strategy.name,
        duration,
        success,
        orderCount: result.length,
        sampleOrder: result[0] || null
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${strategy.name}: Failed after ${duration}ms`, error);
      
      results.push({
        name: strategy.name,
        duration,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  console.log("🧪 Strategy test results:", results);
  return results;
}