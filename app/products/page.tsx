import { Suspense } from 'react';
import { ProductsClient } from './products-client';

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-semibold">Loading products...</div>
      </div>
    }>
      <ProductsClient />
    </Suspense>
  );
}

