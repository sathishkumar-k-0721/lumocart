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
import { FiPackage, FiCheckCircle, FiTruck, FiClock, FiMapPin } from 'react-icons/fi';

interface Order {
  id: string;
  orderNumber: string;
  items: Array<{
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  billingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login?callbackUrl=/orders/' + params.id);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        } else {
          toast.error('Order not found');
          router.push('/account');
        }
      } catch (error) {
        toast.error('Failed to load order');
        router.push('/account');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [session, status, router, params.id]);

  if (status === 'loading' || loading) {
    return <LoadingPage />;
  }

  if (!order) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'SHIPPED':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'PROCESSING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <FiCheckCircle className="h-6 w-6" />;
      case 'SHIPPED':
        return <FiTruck className="h-6 w-6" />;
      case 'PROCESSING':
        return <FiClock className="h-6 w-6" />;
      default:
        return <FiPackage className="h-6 w-6" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/orders"
          className="mb-4 inline-flex items-center text-sm text-blue-600 hover:underline"
        >
          ← Back to Orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusIcon(order.status)}
            {order.status}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {order.items.map((item, index) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex gap-4">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
                      >
                        <Image
                          src={item.product.images[0] || '/placeholder.png'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-1 text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiMapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-gray-600">{order.shippingAddress.phone}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.addressLine1}
                </p>
                {order.shippingAddress.addressLine2 && (
                  <p className="text-gray-600">
                    {order.shippingAddress.addressLine2}
                  </p>
                )}
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.pincode}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiMapPin className="h-5 w-5" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-gray-900">
                  {order.billingAddress.fullName}
                </p>
                <p className="text-gray-600">{order.billingAddress.phone}</p>
                <p className="text-gray-600">{order.billingAddress.addressLine1}</p>
                {order.billingAddress.addressLine2 && (
                  <p className="text-gray-600">
                    {order.billingAddress.addressLine2}
                  </p>
                )}
                <p className="text-gray-600">
                  {order.billingAddress.city}, {order.billingAddress.state}{' '}
                  {order.billingAddress.pincode}
                </p>
              </div>
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
              {/* Payment Status */}
              <div>
                <span className="text-sm text-gray-600">Payment Status</span>
                <p
                  className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-green-100 text-green-700'
                      : order.paymentStatus === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {order.paymentStatus}
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <span className="text-sm text-gray-600">Payment Method</span>
                <p className="mt-1 font-medium text-gray-900 capitalize">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 
                   order.paymentMethod === 'online' ? 'Online Payment' : 
                   order.paymentMethod || 'N/A'}
                </p>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 border-t pt-4">
                <Link href="/products">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.print()}
                >
                  Print Order
                </Button>
              </div>

              {/* Help */}
              <div className="border-t pt-4 text-sm text-gray-600">
                <p className="mb-2 font-medium">Need help?</p>
                <p>
                  Contact us at{' '}
                  <a
                    href="mailto:support@lumo.com"
                    className="text-blue-600 hover:underline"
                  >
                    support@lumo.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
