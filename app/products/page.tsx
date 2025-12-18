import { Suspense } from 'react';
import { ProductsClient } from './products-client';

function ProductsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 md:px-14 lg:px-20 py-6 md:py-8">
        {/* Filter Skeleton */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6 md:mb-8 animate-pulse">
          <div className="h-5 md:h-6 bg-gray-200 rounded w-24 md:w-32 mb-3 md:mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="h-10 md:h-12 bg-gray-200 rounded"></div>
            <div className="h-10 md:h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg md:rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="h-32 md:h-40 bg-gray-200"></div>
              <div className="p-2 md:p-3">
                <div className="h-3 md:h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-5 md:h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoadingSkeleton />}>
      <ProductsClient />
    </Suspense>
  );
}

