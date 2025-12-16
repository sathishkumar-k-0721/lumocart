'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    stock: number;
  };
  quantity: number;
  price: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [processing, setProcessing] = React.useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState<'online' | 'cod'>('online');
  const [checkoutData, setCheckoutData] = React.useState<{
    shippingAddress: Address;
    billingAddress: Address;
  } | null>(null);

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      // Get checkout data from session storage
      const savedData = sessionStorage.getItem('checkoutData');
      if (!savedData) {
        toast.error('Please complete checkout first');
        router.push('/checkout');
        return;
      }

      setCheckoutData(JSON.parse(savedData));

      // Fetch cart
      fetch('/api/cart')
        .then((res) => res.json())
        .then((data) => {
          if (!data.cart || data.cart.items.length === 0) {
            toast.error('Your cart is empty');
            router.push('/cart');
            return;
          }
          setCart(data.cart);
          setLoading(false);
        })
        .catch(() => {
          toast.error('Failed to load cart');
          setLoading(false);
        });
    }
  }, [status, router]);

  const subtotal = cart?.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ) || 0;
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const handlePayment = async () => {
    if (!cart || !checkoutData) return;

    // Check if Razorpay is required and loaded
    if (selectedPayment === 'online' && !window.Razorpay) {
      toast.error('Payment gateway is loading. Please try again.');
      return;
    }

    setProcessing(true);

    try {
      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          shippingAddress: checkoutData.shippingAddress,
          billingAddress: checkoutData.billingAddress,
          total,
          paymentMethod: selectedPayment,
        }),
      });

      if (!orderRes.ok) {
        const error = await orderRes.json();
        toast.error(error.error || 'Failed to create order');
        setProcessing(false);
        return;
      }

      const orderData = await orderRes.json();

      if (selectedPayment === 'cod') {
        // For COD, directly navigate to order confirmation
        toast.success('Order placed successfully!');
        sessionStorage.removeItem('checkoutData');
        router.push(`/orders/${orderData.order.id}`);
        return;
      }

      // Check if Razorpay order was created
      if (!orderData.razorpayOrder) {
        toast.error('Payment gateway not available. Please use Cash on Delivery.');
        setProcessing(false);
        return;
      }

      // Initialize Razorpay for online payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.razorpayOrder.amount,
        currency: orderData.razorpayOrder.currency,
        name: 'Lumo',
        description: `Order #${orderData.order.orderNumber}`,
        order_id: orderData.razorpayOrder.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyRes = await fetch('/api/orders/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderData.order.id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              toast.success('Payment successful!');
              sessionStorage.removeItem('checkoutData');
              router.push(`/orders/${orderData.order.id}`);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            toast.error('Payment verification failed');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: checkoutData.shippingAddress.fullName,
          contact: checkoutData.shippingAddress.phone,
        },
        theme: {
          color: '#dc2626',
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error('An error occurred');
      setProcessing(false);
    }
  };

  if (status === 'loading' || loading) {
    return <LoadingPage />;
  }

  if (!cart || !checkoutData) {
    return null;
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />

      <div className="container mx-auto px-14 md:px-20 py-8">
        <div className="mb-8">
          <div className="border-t-4 border-red-600 mb-4"></div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Method</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Payment Options */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-gray-200 hover:border-red-500 shadow-md transition-all">
              <CardHeader>
                <CardTitle className="text-gray-900">Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Razorpay Loading Indicator */}
                {!razorpayLoaded && selectedPayment === 'online' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm text-blue-700">
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Loading payment gateway...</span>
                  </div>
                )}

                {/* Online Payment */}
                <div
                  onClick={() => setSelectedPayment('online')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPayment === 'online'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedPayment === 'online'}
                      onChange={() => setSelectedPayment('online')}
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Online Payment (UPI, Cards, Net Banking)
                      </h3>
                      <p className="text-sm text-gray-600">
                        Pay securely using UPI, Credit/Debit Cards, or Net Banking via Razorpay
                      </p>
                      <div className="flex gap-2 mt-3">
                        <span className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium">
                          💳 Cards
                        </span>
                        <span className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium">
                          📱 UPI
                        </span>
                        <span className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium">
                          🏦 Net Banking
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setSelectedPayment('cod')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPayment === 'cod'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedPayment === 'cod'}
                      onChange={() => setSelectedPayment('cod')}
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Cash on Delivery (COD)
                      </h3>
                      <p className="text-sm text-gray-600">
                        Pay with cash when you receive your order
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        ₹40 additional handling charges may apply
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address Summary */}
            <Card className="border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-gray-900">
                    {checkoutData.shippingAddress.fullName}
                  </p>
                  <p className="text-gray-700">{checkoutData.shippingAddress.addressLine1}</p>
                  {checkoutData.shippingAddress.addressLine2 && (
                    <p className="text-gray-700">{checkoutData.shippingAddress.addressLine2}</p>
                  )}
                  <p className="text-gray-700">
                    {checkoutData.shippingAddress.city}, {checkoutData.shippingAddress.state} - {checkoutData.shippingAddress.pincode}
                  </p>
                  <p className="text-gray-700">Phone: {checkoutData.shippingAddress.phone}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-medium text-gray-900">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-900">
                      {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {selectedPayment === 'cod' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">COD Charges</span>
                      <span className="font-medium text-gray-900">₹40.00</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-red-600">
                      ₹{(total + (selectedPayment === 'cod' ? 40 : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white hover:from-red-700 hover:via-red-800 hover:to-red-900"
                  size="lg"
                  loading={processing}
                >
                  {processing
                    ? 'Processing...'
                    : selectedPayment === 'online'
                    ? 'Pay Now'
                    : 'Confirm Order'}
                </Button>

                {/* Security Features */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>🔒</span>
                    <span>
                      {selectedPayment === 'online'
                        ? 'Secure payment by Razorpay'
                        : 'Secure COD delivery'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>✓</span>
                    <span>100% secure transactions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>✓</span>
                    <span>Easy returns within 7 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
