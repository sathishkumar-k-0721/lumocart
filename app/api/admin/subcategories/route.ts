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
    const subcategories = await db
      .collection('subcategories')
      .find({})
      .toArray();
    return NextResponse.json(subcategories);
  } catch (error) {
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
    const db = await getDb();
    
    const result = await db.collection('subcategories').insertOne({
      ...body,
      categoryId: new ObjectId(body.categoryId),
      slug: body.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date(),
    });

    return NextResponse.json(
      { _id: result.insertedId, ...body },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create subcategory' },
      { status: 500 }
    );
  }
}
