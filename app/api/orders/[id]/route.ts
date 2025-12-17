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

    // Fetch product details for items in ONE query
    const items = order.items as Array<{ productId: string; quantity: number; price: number }>;
    const productIds = items.map(item => item.productId);
    
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
      },
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    const itemsWithProducts = items.map(item => ({
      ...item,
      product: productMap.get(item.productId) || null,
    }));

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
