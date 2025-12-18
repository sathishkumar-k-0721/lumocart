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

// GET /api/products - List all products with pagination and filters
export async function GET(req: NextRequest) {
  try {
    const client = await getMongoClient();
    const db = client.db('lumocart');
    
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const subcategoryId = searchParams.get('subcategoryId');

    let filter: any = { isVisible: true };
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    if (subcategoryId) {
      filter.subcategoryId = subcategoryId;
    }

    const products = await db.collection('products')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    const transformed = products.map(prod => ({
      _id: prod._id.toString(),
      id: prod._id.toString(),
      name: prod.name,
      price: prod.price,
      originalPrice: prod.originalPrice,
      stock: prod.stock,
      categoryId: prod.categoryId,
      subcategoryId: prod.subcategoryId,
      isVisible: prod.isVisible,
      featured: prod.featured,
      image: prod.image,
      images: prod.images,
      description: prod.description,
    }));
    
    return NextResponse.json({
      success: true,
      products: transformed,
      pagination: {
        page: 1,
        limit: transformed.length,
        total: transformed.length,
        pages: 1,
      },
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product (Admin only)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await req.json();
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: parseFloat(body.price),
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
        image: body.image,
        images: body.images || [],
        categoryId: body.categoryId || null,
        stock: parseInt(body.stock) || 0,
        featured: body.featured || false,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        product,
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
    
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
