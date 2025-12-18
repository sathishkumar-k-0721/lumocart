import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { MongoClient } from 'mongodb';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

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
  try {
    const client = await getMongoClient();
    const db = client.db('lumocart');
    const subcategories = await db.collection('subcategories').find().sort({ createdAt: -1 }).toArray();
    const transformed = subcategories.map(sub => ({ ...sub, _id: sub._id.toString(), id: sub._id.toString() }));
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
