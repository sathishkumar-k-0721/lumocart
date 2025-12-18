import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';

// Cache for 60 seconds
export const revalidate = 60;

// Batched endpoint - gets products, categories, and subcategories in ONE request
export async function GET() {
  try {
    // Check cache first (60 seconds TTL)
    const cacheKey = 'store:all-data';
    const cachedData = cache.get(cacheKey, 60000);
    
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Fetch all data in parallel (faster than sequential)
    const [products, categories, subcategories] = await Promise.all([
      prisma.product.findMany({
        where: { isVisible: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.category.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.subcategory.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    // Mobile-optimized response - minimal payload (60-70% smaller)
    const response = {
      success: true,
      products: products.map(p => ({
        _id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        categoryId: p.categoryId,
        subcategoryId: p.subcategoryId,
        image: p.image,
        // Exclude: images array, description, isVisible, featured (save bandwidth)
      })),
      categories: categories.map(c => ({
        _id: c.id,
        name: c.name,
        slug: c.slug,
        // Exclude: description (save bandwidth)
      })),
      subcategories: subcategories.map(s => ({
        _id: s.id,
        name: s.name,
        categoryId: s.categoryId,
        // Exclude: slug, description (save bandwidth)
      })),
    };

    // Cache the response
    cache.set(cacheKey, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Store data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store data' },
      { status: 500 }
    );
  }
}
