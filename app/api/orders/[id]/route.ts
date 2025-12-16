import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/orders/[id] - Get order by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        userId: user.id, // Users can only see their own orders
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Fetch product details for items
    const items = order.items as Array<{ productId: string; quantity: number; price: number }>;
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
          },
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

    return NextResponse.json({ order: orderWithProducts });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
