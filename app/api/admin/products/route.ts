import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { MongoClient, ObjectId } from 'mongodb';

const mongoUrl = process.env.DATABASE_URL!;
const dbName = 'giftwebsite';

async function getDb() {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  return client.db(dbName);
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
    const db = await getDb();
    const searchParams = req.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const subcategoryId = searchParams.get('subcategoryId');

    let query: any = {};
    if (categoryId) {
      query.categoryId = new ObjectId(categoryId);
    }
    if (subcategoryId) {
      query.subcategoryId = new ObjectId(subcategoryId);
    }

    const products = await db.collection('products').find(query).toArray();
    return NextResponse.json(products);
  } catch (error) {
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
    const db = await getDb();
    
    const result = await db.collection('products').insertOne({
      ...body,
      categoryId: new ObjectId(body.categoryId),
      subcategoryId: new ObjectId(body.subcategoryId),
      slug: body.name.toLowerCase().replace(/\s+/g, '-'),
      isVisible: body.isVisible !== undefined ? body.isVisible : true,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { _id: result.insertedId, ...body },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
