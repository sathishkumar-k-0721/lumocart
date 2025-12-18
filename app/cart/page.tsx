'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import toast from 'react-hot-toast';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';

interface CartItem {
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    images?: string[];
    stock: number;
  };
  quantity: number;
  price: number;
}

interface Cart {
  id: string;
  items: CartItem[];
}

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updatingItems, setUpdatingItems] = React.useState<Set<string>>(new Set());

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login?callbackUrl=/cart');
      return;
    }

    fetchCart();
  }, [session, status, router]);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      // Update locally first for immediate feedback
      if (cart) {
        setCart({
          ...cart,
          items: cart.items.map(item => 
            item.productId === productId ? { ...item, quantity: newQuantity } : item
          ),
        });
      }

      const res = await fetch(`/api/cart/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      });

      if (!res.ok) {
        // Revert on error
        await fetchCart();
        const data = await res.json();
        toast.error(data.error || 'Failed to update quantity');
      } else {
        // Trigger cart update event
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      // Revert on error
      await fetchCart();
      toast.error('An error occurred');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const removeItem = async (productId: string) => {
    if (!cart) return;

    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      const res = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Update cart locally after successful deletion
        setCart({
          ...cart,
          items: cart.items.filter(item => item.productId !== productId),
        });
        toast.success('Item removed from cart');
        // Trigger cart update event
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Remove item error:', error);
      toast.error('An error occurred');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
      });

      if (res.ok) {
        setCart({ ...cart!, items: [] });
        toast.success('Cart cleared');
      } else {
        toast.error('Failed to clear cart');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (status === 'loading' || loading) {
    return <LoadingPage />;
  }

  const subtotal = cart?.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ) || 0;

  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-14 lg:px-20 py-12 md:py-16 min-h-[calc(100vh-400px)]">
        <div className="mx-auto max-w-md text-center bg-white p-6 md:p-8 rounded-lg shadow-md">
          <FiShoppingBag className="mx-auto h-20 w-20 md:h-24 md:w-24 text-gray-300" />
          <h1 className="mt-4 md:mt-6 text-2xl md:text-3xl font-bold text-gray-900">
            Your cart is empty
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button 
            onClick={() => router.push('/')} 
            className="mt-6 md:mt-8 bg-gradient-to-r from-red-600 via-red-500 to-red-400 hover:from-red-700 hover:via-red-600 hover:to-red-500" 
            size="lg"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-14 lg:px-20 py-6 md:py-8 min-h-[calc(100vh-400px)]">
      {/* Header */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border-t-4 border-red-600 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-red-600">Shopping Cart</h1>
        <p className="text-gray-600 text-xs md:text-sm mt-2">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Cart Items ({cart.items.length})</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 text-xs md:text-sm px-2 md:px-4"
              >
                Clear Cart
              </Button>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="divide-y">
                {cart.items.map((item) => {
                  const isUpdating = updatingItems.has(item.productId);
                  
                  return (
                    <div
                      key={item.productId}
                      className={`py-4 md:py-6 first:pt-0 last:pb-0 ${
                        isUpdating ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex gap-3 md:gap-4">
                        {/* Product Image */}
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="relative h-20 w-20 md:h-24 md:w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
                        >
                          <Image
                            src={item.product.images?.[0] || item.product.image || '/placeholder.png'}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </Link>

                        {/* Product Info */}
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <div className="flex-1">
                              <Link
                                href={`/products/${item.product.slug}`}
                                className="font-medium text-sm md:text-base text-gray-900 hover:text-blue-600 line-clamp-2"
                              >
                                {item.product.name}
                              </Link>
                              <p className="mt-1 text-xs md:text-sm text-gray-500">
                                ₹{item.product.price.toFixed(2)} each
                              </p>
                            </div>
                            <p className="font-medium text-sm md:text-base text-gray-900 whitespace-nowrap">
                              ₹{(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="mt-3 md:mt-4 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 md:h-8 md:w-8"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1 || isUpdating}
                              >
                                <FiMinus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 md:w-12 text-center text-xs md:text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 md:h-8 md:w-8"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity + 1
                                  )
                                }
                                disabled={
                                  item.quantity >= item.product.stock || isUpdating
                                }
                              >
                                <FiPlus className="h-3 w-3" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.productId)}
                              disabled={isUpdating}
                              className="text-red-600 hover:text-red-700 text-xs md:text-sm px-2 md:px-3"
                            >
                              <FiTrash2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                              Remove
                            </Button>
                          </div>

                          {/* Stock Warning */}
                          {item.quantity > item.product.stock && (
                            <p className="mt-2 text-sm text-red-600">
                              Only {item.product.stock} in stock
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
                {subtotal < 500 && subtotal > 0 && (
                  <p className="text-xs md:text-sm text-blue-600">
                    Add ₹{(500 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                )}
              </div>

              <div className="border-t pt-3 md:pt-4">
                <div className="flex justify-between text-base md:text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={() => router.push('/checkout')}
                className="w-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 hover:from-red-700 hover:via-red-600 hover:to-red-500 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-sm md:text-base"
                size="lg"
              >
                Proceed to Checkout
              </Button>

              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50 text-sm md:text-base"
              >
                Continue Shopping
              </Button>

              {/* Features */}
              <div className="space-y-2 border-t pt-3 md:pt-4">
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <span>✓</span>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <span>✓</span>
                  <span>Free shipping over ₹500</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                  <span>✓</span>
                  <span>Easy returns</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

