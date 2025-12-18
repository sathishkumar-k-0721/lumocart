import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const start = Date.now();
  
  try {
    const count = await prisma.product.count();
    const elapsed = Date.now() - start;
    
    return NextResponse.json({
      success: true,
      count,
      elapsed: `${elapsed}ms`,
      message: elapsed < 1000 ? '✅ Fast!' : '❌ Too slow!'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      elapsed: `${Date.now() - start}ms`
    }, { status: 500 });
  }
}
