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

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const subcategoryId = searchParams.get('subcategoryId');

    let where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        price: true,
        originalPrice: true,
        stock: true,
        categoryId: true,
        subcategoryId: true,
        isVisible: true,
        featured: true,
        image: true,
        images: true,
        description: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    const transformed = products.map(prod => ({ ...prod, _id: prod.id }));
    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description || '',
        price: body.price,
        originalPrice: body.originalPrice !== undefined && body.originalPrice !== null ? body.originalPrice : null,
        stock: body.stock,
        categoryId: body.categoryId,
        subcategoryId: body.subcategoryId,
        slug: body.name.toLowerCase().replace(/\s+/g, '-'),
        image: body.image || '',
        images: body.images || [],
        isVisible: body.isVisible !== undefined ? body.isVisible : true,
        featured: body.featured || false,
      },
    });

    return NextResponse.json({ ...product, _id: product.id }, { status: 201 });
  } catch (error) {
    console.error('Product POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
