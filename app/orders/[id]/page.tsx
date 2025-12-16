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
import { FiPackage, FiCheckCircle, FiTruck, FiClock, FiMapPin, FiShoppingBag, FiCreditCard, FiX, FiRotateCw, FiArrowLeft, FiPrinter } from 'react-icons/fi';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'border-green-500 bg-green-50 text-green-700';
      case 'SHIPPED':
        return 'border-blue-500 bg-blue-50 text-blue-700';
      case 'PROCESSING':
        return 'border-orange-500 bg-orange-50 text-orange-700';
      case 'CANCELLED':
        return 'border-red-500 bg-red-50 text-red-700';
      default:
        return 'border-gray-400 bg-gray-50 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <FiCheckCircle className="h-5 w-5" />;
      case 'SHIPPED':
        return <FiTruck className="h-5 w-5" />;
      case 'PROCESSING':
        return <FiRotateCw className="h-5 w-5" />;
      case 'CANCELLED':
        return <FiX className="h-5 w-5" />;
      default:
        return <FiClock className="h-5 w-5" />;
    }
  };

  if (status === 'loading' || loading) {
    return <LoadingPage />;
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto px-14 md:px-20 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="border-t-4 border-red-600 mb-4"></div>
        <Link
          href="/orders"
          className="mb-4 inline-flex items-center text-sm text-red-600 hover:text-red-700 font-semibold"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
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
            className={`inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 font-semibold shadow-sm ${getStatusColor(
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
          <Card className="border-gray-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <FiShoppingBag className="h-5 w-5 text-red-600" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <div key={index} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex gap-4">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200 hover:border-red-500 transition-colors"
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
                            className="font-semibold text-gray-900 hover:text-red-600 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-700">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-sm text-gray-600">×</span>
                            <span className="text-sm text-gray-600">₹{item.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-red-600">
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
          <Card className="border-gray-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <FiTruck className="h-5 w-5 text-blue-600" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <p className="font-bold text-gray-900 text-base">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-gray-700 font-medium">{order.shippingAddress.phone}</p>
                <div className="pt-2 border-t border-gray-200">
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
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card className="border-gray-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <FiCreditCard className="h-5 w-5 text-green-600" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <p className="font-bold text-gray-900 text-base">
                  {order.billingAddress.fullName}
                </p>
                <p className="text-gray-700 font-medium">{order.billingAddress.phone}</p>
                <div className="pt-2 border-t border-gray-200">
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white">
              <CardTitle className="flex items-center gap-2">
                <FiPackage className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Payment Status */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <span className="text-sm text-gray-600 font-medium">Payment Status</span>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white'
                        : order.paymentStatus === 'PENDING'
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                        : 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                    }`}
                  >
                    <FiCheckCircle className="h-4 w-4" />
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <span className="text-sm text-blue-700 font-medium">Payment Method</span>
                <p className="mt-2 font-bold text-gray-900 flex items-center gap-2">
                  <FiCreditCard className="h-5 w-5 text-blue-600" />
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 
                   order.paymentMethod === 'online' ? 'Online Payment' : 
                   order.paymentMethod || 'N/A'}
                </p>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border-2 border-red-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-red-600">₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 border-t pt-4">
                <Link href="/products">
                  <Button className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white hover:from-red-700 hover:via-red-800 hover:to-red-900 shadow-md">
                    <FiShoppingBag className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-50"
                  onClick={() => window.print()}
                >
                  <FiPrinter className="mr-2 h-4 w-4" />
                  Print Order
                </Button>
              </div>

              {/* Help */}
              <div className="border-t pt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                <p className="mb-2 font-bold text-gray-900">Need help?</p>
                <p>
                  Contact us at{' '}
                  <a
                    href="mailto:support@lumo.com"
                    className="text-red-600 hover:text-red-700 font-semibold hover:underline"
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
