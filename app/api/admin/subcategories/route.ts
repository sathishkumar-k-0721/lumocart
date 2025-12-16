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
    const subcategories = await prisma.subcategory.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const transformed = subcategories.map(sub => ({ ...sub, _id: sub.id }));
    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Subcategories GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subcategories' },
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
    
    const subcategory = await prisma.subcategory.create({
      data: {
        name: body.name,
        categoryId: body.categoryId,
        slug: body.name.toLowerCase().replace(/\s+/g, '-'),
        description: body.description || '',
        image: body.image || '',
      },
    });

    return NextResponse.json({ ...subcategory, _id: subcategory.id }, { status: 201 });
  } catch (error) {
    console.error('Subcategory POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create subcategory' },
      { status: 500 }
    );
  }
}
