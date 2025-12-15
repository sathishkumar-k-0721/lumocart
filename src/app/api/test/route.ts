import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection by counting documents
    const [userCount, productCount, categoryCount, orderCount] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
    ])

    return NextResponse.json({
      success: true,
      message: '✅ Database connection successful!',
      data: {
        database: 'MongoDB (Connected)',
        collections: {
          users: userCount,
          products: productCount,
          categories: categoryCount,
          orders: orderCount,
        },
        prisma: 'v5.x',
        nextjs: 'v16.x',
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
