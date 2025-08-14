import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test 1: Basic connection
    const orderCount = await prisma.lineOrder.count();
    const connectionTime = Date.now() - startTime;
    
    // Test 2: Simple query
    const queryStart = Date.now();
    const recentOrder = await prisma.lineOrder.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
        orderNumber: true,
        createdAt: true
      }
    });
    const queryTime = Date.now() - queryStart;
    
    // Test 3: Write test
    const writeStart = Date.now();
    const testWrite = await prisma.lineOrder.create({
      data: {
        orderNumber: `DB-TEST-${Date.now()}`,
        customerId: '6708677a078944327c4629e5',
        customerName: 'DB Test',
        orderAmount: 1,
        orderType: 'sale',
        source: 'test',
        status: 'PENDING'
      }
    });
    const writeTime = Date.now() - writeStart;
    
    // Clean up
    await prisma.lineOrder.delete({ where: { id: testWrite.id } });
    
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      tests: {
        connection: `✅ Connected (${connectionTime}ms)`,
        query: `✅ Query successful (${queryTime}ms)`,
        write: `✅ Write successful (${writeTime}ms)`,
        totalTime: `${totalTime}ms`
      },
      data: {
        totalOrders: orderCount,
        lastOrder: recentOrder,
        environment: process.env.NODE_ENV,
        mongoUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
      }
    });
  } catch (error: any) {
    const errorTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.name,
      timeToError: `${errorTime}ms`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}