import { NextRequest, NextResponse } from 'next/server';
import { getAllOrdersPaginated } from '@/actions/pos';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing orders loading...');
    
    // Test 1: Check total orders in database (no filters)
    const totalOrdersCount = await prisma.lineOrder.count();
    console.log(`Total orders in database: ${totalOrdersCount}`);
    
    // Test 2: Check orders with lineOrderItems
    const ordersWithItemsCount = await prisma.lineOrder.count({
      where: {
        lineOrderItems: {
          some: {}
        }
      }
    });
    console.log(`Orders with line items: ${ordersWithItemsCount}`);
    
    // Test 3: Get a few sample orders to inspect structure
    const sampleOrders = await prisma.lineOrder.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        lineOrderItems: true
      }
    });
    console.log(`Sample orders found: ${sampleOrders.length}`);
    
    // Test 4: Check lineOrderItems table directly
    const totalLineItems = await prisma.lineOrderItem.count();
    console.log(`Total line order items: ${totalLineItems}`);
    
    // Test 5: Test the paginated function
    const start = Date.now();
    const result = await getAllOrdersPaginated(1, 10);
    const end = Date.now();
    
    const responseData = {
      success: true,
      loadTime: `${end - start}ms`,
      databaseAnalysis: {
        totalOrders: totalOrdersCount,
        ordersWithItems: ordersWithItemsCount,
        totalLineItems: totalLineItems,
        sampleOrdersCount: sampleOrders.length,
        sampleOrders: sampleOrders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          orderAmount: order.orderAmount,
          lineItemsCount: order.lineOrderItems?.length || 0,
          createdAt: order.createdAt
        }))
      },
      paginatedResult: {
        ordersCount: result?.orders?.length || 0,
        totalCount: result?.totalCount || 0,
        hasData: !!result,
        firstOrder: result?.orders?.[0] || null
      }
    };

    console.log('Comprehensive orders test result:', responseData);
    
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Orders test error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 