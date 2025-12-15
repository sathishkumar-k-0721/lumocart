import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// GET /api/categories - List all categories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
        ...(includeProducts && {
          products: {
            take: 10,
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              image: true,
            },
          },
        }),
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new category (Admin only)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await req.json();
    
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        image: body.image || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Category created successfully',
        category,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      );
    }
    
    console.error('Failed to create category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
