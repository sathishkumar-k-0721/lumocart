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
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [shakeFields, setShakeFields] = React.useState<Set<string>>(new Set());

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
    const newErrors: Record<string, string> = {};
    const fieldsToShake = new Set<string>();

    // Validate shipping address
    if (!shippingAddress.fullName.trim()) {
      newErrors['shipping.fullName'] = 'Full name is required';
      fieldsToShake.add('shipping.fullName');
    }

    if (!shippingAddress.phone.trim()) {
      newErrors['shipping.phone'] = 'Phone number is required';
      fieldsToShake.add('shipping.phone');
    } else if (!/^\d{10}$/.test(shippingAddress.phone)) {
      newErrors['shipping.phone'] = 'Please enter a valid 10-digit phone number';
      fieldsToShake.add('shipping.phone');
    }

    if (!shippingAddress.addressLine1.trim()) {
      newErrors['shipping.addressLine1'] = 'Address is required';
      fieldsToShake.add('shipping.addressLine1');
    }

    if (!shippingAddress.city.trim()) {
      newErrors['shipping.city'] = 'City is required';
      fieldsToShake.add('shipping.city');
    }

    if (!shippingAddress.state.trim()) {
      newErrors['shipping.state'] = 'State is required';
      fieldsToShake.add('shipping.state');
    }

    if (!shippingAddress.pincode.trim()) {
      newErrors['shipping.pincode'] = 'Pincode is required';
      fieldsToShake.add('shipping.pincode');
    } else if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      newErrors['shipping.pincode'] = 'Please enter a valid 6-digit pincode';
      fieldsToShake.add('shipping.pincode');
    }

    // Validate billing address if not same as shipping
    if (!sameAsShipping) {
      if (!billingAddress.fullName.trim()) {
        newErrors['billing.fullName'] = 'Full name is required';
        fieldsToShake.add('billing.fullName');
      }

      if (!billingAddress.phone.trim()) {
        newErrors['billing.phone'] = 'Phone number is required';
        fieldsToShake.add('billing.phone');
      } else if (!/^\d{10}$/.test(billingAddress.phone)) {
        newErrors['billing.phone'] = 'Please enter a valid 10-digit phone number';
        fieldsToShake.add('billing.phone');
      }

      if (!billingAddress.addressLine1.trim()) {
        newErrors['billing.addressLine1'] = 'Address is required';
        fieldsToShake.add('billing.addressLine1');
      }

      if (!billingAddress.city.trim()) {
        newErrors['billing.city'] = 'City is required';
        fieldsToShake.add('billing.city');
      }

      if (!billingAddress.state.trim()) {
        newErrors['billing.state'] = 'State is required';
        fieldsToShake.add('billing.state');
      }

      if (!billingAddress.pincode.trim()) {
        newErrors['billing.pincode'] = 'Pincode is required';
        fieldsToShake.add('billing.pincode');
      } else if (!/^\d{6}$/.test(billingAddress.pincode)) {
        newErrors['billing.pincode'] = 'Please enter a valid 6-digit pincode';
        fieldsToShake.add('billing.pincode');
      }
    }

    setErrors(newErrors);
    
    if (fieldsToShake.size > 0) {
      setShakeFields(fieldsToShake);
      // Remove shake animation after it completes
      setTimeout(() => setShakeFields(new Set()), 500);
      toast.error('Please fill in all required fields correctly');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = () => {
    if (!validateForm()) return;

    // Store order details in sessionStorage
    sessionStorage.setItem('checkoutData', JSON.stringify({
      shippingAddress,
      billingAddress: sameAsShipping ? shippingAddress : billingAddress,
      sameAsShipping,
    }));

    // Navigate to payment page
    router.push('/payment');
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
                <div className={shakeFields.has('shipping.fullName') ? 'shake' : ''}>
                  <Input
                    label="Full Name"
                    value={shippingAddress.fullName}
                    onChange={(e) => {
                      setShippingAddress({ ...shippingAddress, fullName: e.target.value });
                      if (errors['shipping.fullName']) {
                        const newErrors = { ...errors };
                        delete newErrors['shipping.fullName'];
                        setErrors(newErrors);
                      }
                    }}
                    error={errors['shipping.fullName']}
                    required
                  />
                </div>
                <div className={shakeFields.has('shipping.phone') ? 'shake' : ''}>
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => {
                      setShippingAddress({ ...shippingAddress, phone: e.target.value });
                      if (errors['shipping.phone']) {
                        const newErrors = { ...errors };
                        delete newErrors['shipping.phone'];
                        setErrors(newErrors);
                      }
                    }}
                    error={errors['shipping.phone']}
                    required
                  />
                </div>
                <div className={shakeFields.has('shipping.addressLine1') ? 'shake' : ''}>
                  <Input
                    label="Address Line 1"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => {
                      setShippingAddress({
                        ...shippingAddress,
                        addressLine1: e.target.value,
                      });
                      if (errors['shipping.addressLine1']) {
                        const newErrors = { ...errors };
                        delete newErrors['shipping.addressLine1'];
                        setErrors(newErrors);
                      }
                    }}
                    error={errors['shipping.addressLine1']}
                    required
                  />
                </div>
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
                  <div className={shakeFields.has('shipping.city') ? 'shake' : ''}>
                    <Input
                      label="City"
                      value={shippingAddress.city}
                      onChange={(e) => {
                        setShippingAddress({ ...shippingAddress, city: e.target.value });
                        if (errors['shipping.city']) {
                          const newErrors = { ...errors };
                          delete newErrors['shipping.city'];
                          setErrors(newErrors);
                        }
                      }}
                      error={errors['shipping.city']}
                      required
                    />
                  </div>
                  <div className={shakeFields.has('shipping.state') ? 'shake' : ''}>
                    <Input
                      label="State"
                      value={shippingAddress.state}
                      onChange={(e) => {
                        setShippingAddress({ ...shippingAddress, state: e.target.value });
                        if (errors['shipping.state']) {
                          const newErrors = { ...errors };
                          delete newErrors['shipping.state'];
                          setErrors(newErrors);
                        }
                      }}
                      error={errors['shipping.state']}
                      required
                    />
                  </div>
                  <div className={shakeFields.has('shipping.pincode') ? 'shake' : ''}>
                    <Input
                      label="Pincode"
                      value={shippingAddress.pincode}
                      onChange={(e) => {
                        setShippingAddress({
                          ...shippingAddress,
                          pincode: e.target.value,
                        });
                        if (errors['shipping.pincode']) {
                          const newErrors = { ...errors };
                          delete newErrors['shipping.pincode'];
                          setErrors(newErrors);
                        }
                      }}
                      error={errors['shipping.pincode']}
                      required
                    />
                  </div>
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
                    <div className={shakeFields.has('billing.fullName') ? 'shake' : ''}>
                      <Input
                        label="Full Name"
                        value={billingAddress.fullName}
                        onChange={(e) => {
                          setBillingAddress({ ...billingAddress, fullName: e.target.value });
                          if (errors['billing.fullName']) {
                            const newErrors = { ...errors };
                            delete newErrors['billing.fullName'];
                            setErrors(newErrors);
                          }
                        }}
                        error={errors['billing.fullName']}
                        required
                      />
                    </div>
                    <div className={shakeFields.has('billing.phone') ? 'shake' : ''}>
                      <Input
                        label="Phone Number"
                        type="tel"
                        value={billingAddress.phone}
                        onChange={(e) => {
                          setBillingAddress({ ...billingAddress, phone: e.target.value });
                          if (errors['billing.phone']) {
                            const newErrors = { ...errors };
                            delete newErrors['billing.phone'];
                            setErrors(newErrors);
                          }
                        }}
                        error={errors['billing.phone']}
                        required
                      />
                    </div>
                    <div className={shakeFields.has('billing.addressLine1') ? 'shake' : ''}>
                      <Input
                        label="Address Line 1"
                        value={billingAddress.addressLine1}
                        onChange={(e) => {
                          setBillingAddress({
                            ...billingAddress,
                            addressLine1: e.target.value,
                          });
                          if (errors['billing.addressLine1']) {
                            const newErrors = { ...errors };
                            delete newErrors['billing.addressLine1'];
                            setErrors(newErrors);
                          }
                        }}
                        error={errors['billing.addressLine1']}
                        required
                      />
                    </div>
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
                      <div className={shakeFields.has('billing.city') ? 'shake' : ''}>
                        <Input
                          label="City"
                          value={billingAddress.city}
                          onChange={(e) => {
                            setBillingAddress({ ...billingAddress, city: e.target.value });
                            if (errors['billing.city']) {
                              const newErrors = { ...errors };
                              delete newErrors['billing.city'];
                              setErrors(newErrors);
                            }
                          }}
                          error={errors['billing.city']}
                          required
                        />
                      </div>
                      <div className={shakeFields.has('billing.state') ? 'shake' : ''}>
                        <Input
                          label="State"
                          value={billingAddress.state}
                          onChange={(e) => {
                            setBillingAddress({ ...billingAddress, state: e.target.value });
                            if (errors['billing.state']) {
                              const newErrors = { ...errors };
                              delete newErrors['billing.state'];
                              setErrors(newErrors);
                            }
                          }}
                          error={errors['billing.state']}
                          required
                        />
                      </div>
                      <div className={shakeFields.has('billing.pincode') ? 'shake' : ''}>
                        <Input
                          label="Pincode"
                          value={billingAddress.pincode}
                          onChange={(e) => {
                            setBillingAddress({
                              ...billingAddress,
                              pincode: e.target.value,
                            });
                            if (errors['billing.pincode']) {
                              const newErrors = { ...errors };
                              delete newErrors['billing.pincode'];
                              setErrors(newErrors);
                            }
                          }}
                          error={errors['billing.pincode']}
                          required
                        />
                      </div>
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
                >
                  Place Order
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