'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { ProductModal } from '@/components/product-modal';

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        // API returns {success: true, products: [...]}
        const productList = data.products || data;
        const visibleProducts = Array.isArray(productList) 
          ? productList.filter((p: any) => p.isVisible !== false)
          : [];
        setProducts(visibleProducts);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      if (res.ok) {
        toast.success('Added to cart!');
        // Trigger cart update event
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add to cart');
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      toast.error('Please login to purchase');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      if (res.ok) {
        router.push('/checkout');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to process');
      }
    } catch (error) {
      toast.error('Failed to process');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-full mx-auto px-4 md:px-14 lg:px-20 py-6 md:py-12">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border-t-4 border-red-600 mb-6 md:mb-8 animate-pulse">
            <div className="h-8 md:h-10 bg-gray-200 rounded w-48 md:w-64 mb-2"></div>
            <div className="h-3 md:h-4 bg-gray-200 rounded w-32 md:w-48"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 animate-pulse">
                <div className="h-32 md:h-40 bg-gray-200"></div>
                <div className="p-2 md:p-3">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-9 bg-gray-200 rounded"></div>
                    <div className="flex-1 h-9 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      {/* All Products */}
      <div className="max-w-full mx-auto px-4 md:px-14 lg:px-20 py-6 md:py-12">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border-t-4 border-red-600 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-red-600">Our Products</h1>
          <p className="text-gray-600 text-xs md:text-sm mt-2">Discover our premium collection</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((product: any) => (
            <div
              key={product._id}
              onClick={() => {
                setSelectedProduct({
                  id: product._id,
                  name: product.name,
                  slug: product.slug,
                  description: product.description,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  image: product.image,
                  images: product.images,
                  stock: product.stock,
                  category: product.category,
                  subcategory: product.subcategory,
                });
                setIsModalOpen(true);
              }}
              className="bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-2xl overflow-hidden border border-gray-200 hover:border-red-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="relative h-32 md:h-40 overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                />
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-2 md:px-3 py-1 rounded-full font-bold text-xs md:text-sm">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-2 md:p-3">
                <h3 className="text-xs md:text-sm font-bold mb-1 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem] hover:text-red-600 transition-colors">{product.name}</h3>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 md:mb-3 gap-1">
                  <div className="flex items-center gap-1 md:gap-2">
                    <span className="text-red-600 font-bold text-sm md:text-base">₹{product.originalPrice || product.price}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 text-xs line-through">₹{product.price}</span>
                    )}
                  </div>
                  {product.originalPrice && product.originalPrice < product.price && (
                    <span className="text-red-600 font-bold text-xs md:text-sm">
                      {Math.round(((product.price - product.originalPrice) / product.price) * 100)}% OFF
                    </span>
                  )}
                </div>
                <div className="flex flex-col md:flex-row gap-1.5 md:gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(e, product);
                    }}
                    disabled={product.stock === 0}
                    className="flex-1 px-2 py-1.5 md:py-2 bg-gradient-to-r from-white via-red-50 to-white text-red-600 rounded-lg border-2 border-red-500 hover:border-red-600 hover:from-red-50 hover:via-red-100 hover:to-red-50 text-xs font-semibold shadow hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyNow(e, product);
                    }}
                    disabled={product.stock === 0}
                    className="flex-1 px-2 py-1.5 md:py-2 bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white rounded-lg hover:from-red-700 hover:via-red-600 hover:to-red-500 text-xs font-semibold shadow hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
