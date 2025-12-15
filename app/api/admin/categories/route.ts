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

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const categories = await db.collection('categories').find({}).toArray();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const db = await getDb();
    
    const result = await db.collection('categories').insertOne({
      ...body,
      slug: body.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date(),
    });

    return NextResponse.json(
      { _id: result.insertedId, ...body },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
