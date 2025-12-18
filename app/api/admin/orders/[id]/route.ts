import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return null;
  }
  return session;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, paymentStatus, notes } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Fetch product details for items in ONE query
    const items = order.items as Array<{ productId: string; quantity: number; price: number }>;
    const productIds = items.map(item => item.productId);
    
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        image: true,
        price: true,
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

    return NextResponse.json(orderWithProducts);
  } catch (error: any) {
    console.error('Failed to update order:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Fetch product details for items in ONE query
    const items = order.items as Array<{ productId: string; quantity: number; price: number }>;
    const productIds = items.map(item => item.productId);
    
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        image: true,
        price: true,
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

    return NextResponse.json(orderWithProducts);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
