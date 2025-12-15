import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return null;
  }
  return session;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: params.id },
    });
    
    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ ...subcategory, _id: subcategory.id });
  } catch (error) {
    console.error('Subcategory GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subcategory' },
      { status: 500 }
    );
  }
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
    
    const subcategory = await prisma.subcategory.update({
      where: { id: params.id },
      data: {
        name: body.name,
        categoryId: body.categoryId,
        slug: body.name.toLowerCase().replace(/\s+/g, '-'),
        description: body.description || '',
        image: body.image || '',
      },
    });

    return NextResponse.json({ ...subcategory, _id: subcategory.id });
  } catch (error) {
    console.error('Subcategory PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update subcategory' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.subcategory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subcategory DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete subcategory' },
      { status: 500 }
    );
  }
}
