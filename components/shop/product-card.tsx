'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Button } from '../ui/button';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number | null;
    image: string;
    stock: number;
    featured?: boolean;
    category?: {
      name: string;
      slug: string;
    } | null;
  };
  onAddToCart?: (productId: string) => void;
  loading?: boolean;
}

export function ProductCard({ product, onAddToCart, loading }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-lg">
      {/* Badge */}
      {discount > 0 && (
        <div className="absolute left-2 top-2 z-10 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
          {discount}% OFF
        </div>
      )}
      
      {product.featured && (
        <div className="absolute right-2 top-2 z-10 rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold text-white">
          Featured
        </div>
      )}

      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.image || '/images/placeholder.png'}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            {product.category.name}
          </Link>
        )}

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock === 0 ? (
          <p className="mt-2 text-sm font-medium text-red-600">Out of Stock</p>
        ) : product.stock < 10 ? (
          <p className="mt-2 text-sm text-orange-600">
            Only {product.stock} left!
          </p>
        ) : null}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => onAddToCart?.(product.id)}
            disabled={product.stock === 0 || loading}
            loading={loading}
            className="flex-1"
            size="sm"
          >
            <FiShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            title="Add to Wishlist"
          >
            <FiHeart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
