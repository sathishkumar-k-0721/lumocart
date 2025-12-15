'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import { ProductCard } from '@/components/shop/product-card';
import toast from 'react-hot-toast';
import { FiMinus, FiPlus, FiShoppingCart, FiHeart, FiShare2 } from 'react-icons/fi';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  stock: number;
  featured: boolean;
  tags?: string[];
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [addingToCart, setAddingToCart] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedImage, setSelectedImage] = React.useState(0);

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products?slug=${params.slug}`);
        const data = await res.json();
        
        if (data.products && data.products.length > 0) {
          const fetchedProduct = data.products[0];
          setProduct(fetchedProduct);

          // Fetch related products from same category
          if (fetchedProduct.category) {
            const relatedRes = await fetch(
              `/api/products?category=${fetchedProduct.category._id}&limit=4`
            );
            const relatedData = await relatedRes.json();
            setRelatedProducts(
              relatedData.products.filter((p: Product) => p._id !== fetchedProduct._id)
            );
          }
        }
      } catch (error) {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  const handleAddToCart = async () => {
    if (!session) {
      toast.error('Please login to add items to cart');
      router.push(`/login?callbackUrl=/products/${params.slug}`);
      return;
    }

    setAddingToCart(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?._id,
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
      toast.error('An error occurred');
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Product Not Found</h1>
        <p className="mt-4 text-gray-600">
          The product you're looking for doesn't exist.
        </p>
        <Button onClick={() => router.push('/products')} className="mt-6">
          Browse Products
        </Button>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product Details */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={product.images[selectedImage] || '/placeholder.png'}
              alt={product.name}
              fill
              className="object-cover"
            />
            {discount > 0 && (
              <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                -{discount}%
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-lg bg-gray-100 ${
                    selectedImage === index ? 'ring-2 ring-blue-600' : ''
                  }`}
                >
                  <Image
                    src={image || '/placeholder.png'}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category */}
          {product.category && (
            <div className="text-sm text-blue-600">{product.category.name}</div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">
              ₹{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-xl text-gray-500 line-through">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div>
            {product.stock > 0 ? (
              <span className="text-green-600">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <FiMinus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-lg font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                  >
                    <FiPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  loading={addingToCart}
                  className="flex-1"
                  size="lg"
                >
                  <FiShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <FiHeart className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={handleShare}
                >
                  <FiShare2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Product Features */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>✓</span>
                <span>Free shipping on orders over ₹500</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>✓</span>
                <span>Easy returns within 7 days</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>✓</span>
                <span>Secure payment processing</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>✓</span>
                <span>100% authentic products</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            You May Also Like
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct._id}
                product={{
                  id: relatedProduct._id,
                  name: relatedProduct.name,
                  slug: relatedProduct.slug,
                  price: relatedProduct.price,
                  originalPrice: relatedProduct.originalPrice,
                  image: relatedProduct.images[0] || '/placeholder.png',
                  stock: relatedProduct.stock,
                  featured: relatedProduct.featured,
                  category: relatedProduct.category,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
