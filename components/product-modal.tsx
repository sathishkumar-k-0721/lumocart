'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from './ui/button';
import toast from 'react-hot-toast';
import { FiX, FiShoppingCart, FiZap, FiPackage, FiTag, FiCheck } from 'react-icons/fi';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  stock: number;
  category?: {
    name: string;
  };
  subcategory?: {
    name: string;
  };
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [addingToCart, setAddingToCart] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setQuantity(1);
      setSelectedImage(0);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Keyboard navigation for images
  React.useEffect(() => {
    if (!isOpen || !product) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const allImages = product.images && product.images.length > 0 
        ? product.images 
        : [product.image];
      const totalImages = allImages.length;

      if (e.key === 'ArrowLeft') {
        setSelectedImage((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedImage((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, product, selectedImage, onClose]);

  if (!isOpen || !product) return null;

  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const handlePrevImage = () => {
    const totalImages = allImages.length;
    setSelectedImage((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = () => {
    const totalImages = allImages.length;
    setSelectedImage((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = async () => {
    if (!session) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    setAddingToCart(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (res.ok) {
        toast.success('Added to cart!');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add to cart');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!session) {
      toast.error('Please login to continue');
      router.push('/login');
      return;
    }

    await handleAddToCart();
    router.push('/cart');
  };

  const discount = product.originalPrice && product.originalPrice < product.price
    ? Math.round(((product.price - product.originalPrice) / product.price) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn border-2 border-red-600">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
          >
            <FiX className="h-6 w-6" />
          </button>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Left: Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-red-600 group">
                <img
                  src={allImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {discount}% OFF
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">Out of Stock</span>
                  </div>
                )}

                {/* Navigation Arrows - Show only if multiple images */}
                {allImages.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                      {selectedImage + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx 
                          ? 'border-red-600 ring-2 ring-red-200' 
                          : 'border-red-600 hover:border-red-600'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="flex flex-col">
              {/* Category & Subcategory */}
              <div className="flex items-center gap-2 mb-3">
                {product.category && (
                  <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
                    {product.category.name}
                  </span>
                )}
                {product.subcategory && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    {product.subcategory.name}
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-red-600">
                  ₹{product.originalPrice ? product.originalPrice.toFixed(2) : product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    ₹{product.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                <FiPackage className={`h-5 w-5 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`font-semibold ${
                  product.stock > 10 
                    ? 'text-green-600' 
                    : product.stock > 0 
                    ? 'text-orange-600' 
                    : 'text-red-600'
                }`}>
                  {product.stock > 10 
                    ? 'In Stock' 
                    : product.stock > 0 
                    ? `Only ${product.stock} left!` 
                    : 'Out of Stock'}
                </span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FiTag className="h-5 w-5 text-red-600" />
                  Product Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Features */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-800">
                    <FiCheck className="h-4 w-4 flex-shrink-0" />
                    <span>100% Authentic Products</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-800">
                    <FiCheck className="h-4 w-4 flex-shrink-0" />
                    <span>Easy Returns & Exchange</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-800">
                    <FiCheck className="h-4 w-4 flex-shrink-0" />
                    <span>Free Shipping on orders above ₹500</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-red-600 hover:bg-red-50 transition-colors text-lg font-bold"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="h-10 w-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-red-600 hover:bg-red-50 transition-colors text-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-auto">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="flex-1 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 h-12 text-base font-semibold"
                >
                  <FiShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || addingToCart}
                  className="flex-1 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white hover:from-red-700 hover:via-red-800 hover:to-red-900 h-12 text-base font-semibold shadow-lg"
                >
                  <FiZap className="mr-2 h-5 w-5" />
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
