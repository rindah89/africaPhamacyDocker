import { NextRequest, NextResponse } from 'next/server';
import { processPaymentAndOrder } from '@/actions/pos';

export const maxDuration = 30; // Maximum allowed duration for Vercel

export async function POST(request: NextRequest) {
  console.log('[API] Order creation request received');
  
  try {
    const body = await request.json();
    const { orderData, customerData, orderNumber, amountPaid, insuranceData } = body;
    
    console.log('[API] Processing order:', {
      orderNumber,
      itemCount: orderData?.orderItems?.length,
      customerName: customerData?.customerName
    });
    
    // Call the server action
    const result = await processPaymentAndOrder(
      orderData,
      customerData,
      orderNumber,
      amountPaid,
      insuranceData
    );
    
    console.log('[API] Order processing result:', {
      success: result.success,
      orderId: result.order?.id
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] Order creation error:', error);
    
    // Check for specific error types
    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order creation timed out. Please try again.',
          details: error.message 
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create order',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}