'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  subtotal: number;
  itemCount: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [processing, setProcessing] = React.useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = React.useState(false);

  const [shippingAddress, setShippingAddress] = React.useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [billingAddress, setBillingAddress] = React.useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [sameAsShipping, setSameAsShipping] = React.useState(true);

  React.useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login?callbackUrl=/checkout');
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await fetch('/api/cart');
        if (res.ok) {
          const data = await res.json();
          if (!data.cart || data.cart.items.length === 0) {
            router.push('/cart');
            return;
          }
          setCart(data.cart);
        }
      } catch (error) {
        toast.error('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [session, status, router]);

  const subtotal = cart?.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ) || 0;

  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const validateForm = () => {
    const required = [
      shippingAddress.fullName,
      shippingAddress.phone,
      shippingAddress.addressLine1,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.pincode,
    ];

    if (!sameAsShipping) {
      required.push(
        billingAddress.fullName,
        billingAddress.phone,
        billingAddress.addressLine1,
        billingAddress.city,
        billingAddress.state,
        billingAddress.pincode
      );
    }

    if (required.some(field => !field)) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm() || !cart) return;

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
          shippingAddress,
          billingAddress: sameAsShipping ? shippingAddress : billingAddress,
          total,
        }),
      });

      if (!orderRes.ok) {
        const error = await orderRes.json();
        toast.error(error.error || 'Failed to create order');
        setProcessing(false);
        return;
      }

      const orderData = await orderRes.json();

      // Initialize Razorpay
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
                orderId: orderData.order._id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              toast.success('Payment successful!');
              router.push(`/orders/${orderData.order._id}`);
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
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#2563eb',
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

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Full Name"
                  value={shippingAddress.fullName}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                  }
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, phone: e.target.value })
                  }
                  required
                />
                <Input
                  label="Address Line 1"
                  value={shippingAddress.addressLine1}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      addressLine1: e.target.value,
                    })
                  }
                  required
                />
                <Input
                  label="Address Line 2 (Optional)"
                  value={shippingAddress.addressLine2}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      addressLine2: e.target.value,
                    })
                  }
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="City"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="State"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, state: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Pincode"
                    value={shippingAddress.pincode}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        pincode: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sameAsShipping"
                    checked={sameAsShipping}
                    onChange={(e) => setSameAsShipping(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="sameAsShipping" className="text-sm text-gray-700">
                    Same as shipping address
                  </label>
                </div>

                {!sameAsShipping && (
                  <>
                    <Input
                      label="Full Name"
                      value={billingAddress.fullName}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, fullName: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={billingAddress.phone}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, phone: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Address Line 1"
                      value={billingAddress.addressLine1}
                      onChange={(e) =>
                        setBillingAddress({
                          ...billingAddress,
                          addressLine1: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      label="Address Line 2 (Optional)"
                      value={billingAddress.addressLine2}
                      onChange={(e) =>
                        setBillingAddress({
                          ...billingAddress,
                          addressLine2: e.target.value,
                        })
                      }
                    />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Input
                        label="City"
                        value={billingAddress.city}
                        onChange={(e) =>
                          setBillingAddress({ ...billingAddress, city: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="State"
                        value={billingAddress.state}
                        onChange={(e) =>
                          setBillingAddress({ ...billingAddress, state: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Pincode"
                        value={billingAddress.pincode}
                        onChange={(e) =>
                          setBillingAddress({
                            ...billingAddress,
                            pincode: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cart?.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  className="w-full"
                  size="lg"
                  loading={processing}
                  disabled={!razorpayLoaded}
                >
                  {razorpayLoaded ? 'Place Order' : 'Loading Payment...'}
                </Button>

                {/* Security Features */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>🔒</span>
                    <span>Secure payment by Razorpay</span>
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

