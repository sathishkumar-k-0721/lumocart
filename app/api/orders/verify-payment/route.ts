import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import crypto from 'crypto';

// POST /api/orders/verify-payment - Verify Razorpay payment
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update order
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'PROCESSING',
        paymentId: razorpay_payment_id,
      },
    });

    // Fetch product details for items
    const items = order.items as Array<{ productId: string; quantity: number; price: number }>;
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        return {
          ...item,
          product,
        };
      })
    );

    const orderWithProducts = {
      ...order,
      items: itemsWithProducts,
    };

    // Clear user's cart after successful payment
    await prisma.cart.updateMany({
      where: { userId: user.id },
      data: { items: [] },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order: orderWithProducts,
    });
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
