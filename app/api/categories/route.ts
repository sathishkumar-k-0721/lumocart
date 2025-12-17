import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
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

// GET /api/categories - List all categories
export async function GET(req: NextRequest) {
  try {
    const client = await getMongoClient();
    const db = client.db('lumocart');

    const categories = await db.collection('categories')
      .find({})
      .sort({ name: 1 })
      .toArray();

    const transformed = categories.map(cat => ({
      _id: cat._id.toString(),
      id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
    }));

    return NextResponse.json({
      success: true,
      categories: transformed,
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
