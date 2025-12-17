import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/auth';
import Razorpay from 'razorpay';
import crypto from 'crypto';
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

// Initialize Razorpay only if keys are available
let razorpay: Razorpay | null = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
}

// GET /api/orders - Get user's orders or all orders (admin)
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const client = await getMongoClient();
    const db = client.db('lumocart');
    
    const { searchParams } = new URL(req.url);
    const isAdmin = user.role === 'ADMIN';

    const where = isAdmin ? {} : { userId: user.id };

    const orders = await db.collection('orders')
      .find(where)
      .sort({ createdAt: -1 })
      .toArray();

    // Collect all unique product IDs from all orders
    const allProductIds = new Set<string>();
    orders.forEach(order => {
      const items = order.items as Array<{ productId: string; quantity: number; price: number }>;
      items.forEach(item => allProductIds.add(item.productId));
    });

    // Fetch all products in ONE query
    const products = await prisma.product.findMany({
      where: { id: { in: Array.from(allProductIds) } },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
      },
    });

    // Create a map for quick lookup
    const productMap = new Map(products.map(p => [p.id, p]));

    // Transform orders with products
    const ordersWithProducts = orders.map(order => {
      const items = order.items as Array<{ productId: string; quantity: number; price: number }>;
      const itemsWithProducts = items.map(item => ({
        ...item,
        product: productMap.get(item.productId) || null,
      }));
      return {
        ...order,
        items: itemsWithProducts,
      };
    });

    return NextResponse.json({
      success: true,
      orders: ordersWithProducts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    
    const { shippingAddress, billingAddress, notes, paymentMethod = 'online' } = body;

    // Get user's cart with embedded items
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart || (cart.items as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    const cartItems = cart.items as any[];
    
    // Get product details and validate stock
    const productIds = cartItems.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    for (const item of cartItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Calculate total
    let totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Add shipping charges
    const shipping = totalAmount > 500 ? 0 : 50;
    totalAmount += shipping;

    // Add COD charges if applicable
    if (paymentMethod === 'cod') {
      totalAmount += 40;
    }

    const orderNumber = generateOrderNumber();
    let razorpayOrder: any = null;

    // Create Razorpay order only for online payment
    if (paymentMethod === 'online') {
      if (razorpay) {
        try {
          razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            receipt: orderNumber,
          });
        } catch (error) {
          console.error('Razorpay order creation failed:', error);
        }
      }
    }

    // Prepare items as Json array
    const orderItems = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        totalAmount,
        razorpayOrderId: razorpayOrder?.id,
        paymentStatus: 'PENDING',
        paymentMethod: paymentMethod,
        status: 'PENDING',
        shippingAddress,
        billingAddress,
        notes,
        items: orderItems,
      },
    });

    // Update stock for all orders (both COD and online payment)
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // For COD, update order status to PROCESSING immediately and clear cart
    if (paymentMethod === 'cod') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PROCESSING',
        },
      });

      // Clear cart only for COD
      await prisma.cart.update({
        where: { id: cart.id },
        data: { items: [] },
      });
    }
    // For online payment, cart will be cleared after successful payment verification

    // Fetch product details for response
    const itemsWithProducts = orderItems.map((item) => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product,
      };
    });

    const orderWithProducts = {
      ...order,
      items: itemsWithProducts,
    };

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: orderWithProducts,
      razorpayOrder: razorpayOrder ? {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      } : null,
    });
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
