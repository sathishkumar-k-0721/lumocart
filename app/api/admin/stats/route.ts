import { NextResponse } from 'next/server';
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

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Use aggregation to get stats efficiently without loading all data
    const [
      productCount,
      categoryCount,
      subcategoryCount,
      productStats,
      orderStats,
      revenueData
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.subcategory.count(),
      prisma.product.aggregate({
        _sum: { stock: true },
        _count: {
          _all: true,
        },
      }),
      prisma.order.groupBy({
        by: ['status', 'paymentStatus'],
        _count: { _all: true },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
        _count: { _all: true },
      }),
    ]);

    // Get additional product stats
    const [visibleCount, featuredCount, outOfStockCount] = await Promise.all([
      prisma.product.count({ where: { isVisible: true } }),
      prisma.product.count({ where: { featured: true } }),
      prisma.product.count({ where: { stock: 0 } }),
    ]);

    // Calculate order stats
    const totalOrders = orderStats.reduce((sum, stat) => sum + stat._count._all, 0);
    const shippedOrders = orderStats
      .filter(stat => stat.status === 'SHIPPED' || stat.status === 'DELIVERED')
      .reduce((sum, stat) => sum + stat._count._all, 0);

    const stats = {
      products: productCount,
      categories: categoryCount,
      subcategories: subcategoryCount,
      totalStock: productStats._sum.stock || 0,
      visibleProducts: visibleCount,
      featuredProducts: featuredCount,
      outOfStock: outOfStockCount,
      totalOrders,
      shippedOrders,
      totalRevenue: revenueData._sum.totalAmount || 0,
      successfulPayments: revenueData._count._all,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
