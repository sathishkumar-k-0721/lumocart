import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { MongoClient } from 'mongodb';

let cachedClient: MongoClient | null = null;

async function getMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(process.env.DATABASE_URL!, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
  
  await client.connect();
  cachedClient = client;
  return client;
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await getMongoClient();
    const db = client.db('lumocart');
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const [orders, total] = await Promise.all([
      db.collection('orders')
        .find(where)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('orders').countDocuments(where)
    ]);

    // Collect all unique product IDs from all orders
    const allProductIds = new Set<string>();
    orders.forEach(order => {
      const items = order.items as Array<{ productId: string; quantity: number; price: number }>;
      items.forEach(item => allProductIds.add(item.productId));
    });

    // Fetch all products in ONE query
    const products = await prisma.product.findMany({
      where: { id: { in: Array.from(allProductIds) } },
      select: {
        id: true,
        name: true,
        image: true,
        price: true,
      },
    });

    // Create a map for quick lookup
    const productMap = new Map(products.map(p => [p.id, p]));

    // Transform orders with products
    const ordersWithProducts = orders.map(order => {
      const items = order.items as Array<{ productId: string; quantity: number; price: number }>;
      const itemsWithProducts = items.map(item => {
        const product = productMap.get(item.productId);
        return {
          ...item,
          id: item.productId,
          product: product ? { ...product, _id: product.id } : null,
        };
      });
      return {
        ...order,
        _id: order.id,
        user: order.user ? { ...order.user, _id: order.user.id } : null,
        items: itemsWithProducts,
      };
    });

    return NextResponse.json({
      orders: ordersWithProducts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
