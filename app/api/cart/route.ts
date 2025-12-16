import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/cart - Get user's cart
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    // Create cart if doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: { 
          userId: user.id,
          items: []
        },
      });
    }

    // Get product details for cart items
    const items = cart.items as any[];
    const productIds = items.map((item: any) => item.productId);
    
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        image: true,
        stock: true,
      },
    });

    // Merge cart items with product details
    const cartItems = items.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product,
      };
    });

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      cart: {
        ...cart,
        items: cartItems,
        subtotal,
        itemCount,
      },
    });
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Failed to fetch cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    
    const { productId, quantity = 1 } = body;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { 
          userId: user.id,
          items: []
        },
      });
    }

    // Check if product exists and get price
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, price: true, stock: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check stock
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Update cart items
    const items = cart.items as any[];
    const existingItemIndex = items.findIndex((item: any) => item.productId === productId);

    let updatedItems;
    if (existingItemIndex >= 0) {
      // Update quantity
      updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      updatedItems = [
        ...items,
        {
          productId,
          quantity,
          price: product.price,
        },
      ];
    }

    // Update cart
    const updatedCart = await prisma.cart.update({
      where: { id: cart.id },
      data: { items: updatedItems },
    });

    // Get product details for response
    const productIds = updatedItems.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        image: true,
        stock: true,
      },
    });

    const cartItems = updatedItems.map((item: any) => {
      const prod = products.find(p => p.id === item.productId);
      return {
        ...item,
        product: prod,
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      cart: {
        ...updatedCart,
        items: cartItems,
      },
    });
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Failed to add to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (cart) {
      await prisma.cart.update({
        where: { id: cart.id },
        data: { items: [] },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    console.error('Failed to clear cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
