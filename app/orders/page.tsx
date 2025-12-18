'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import toast from 'react-hot-toast';
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiShoppingBag, FiMapPin, FiCreditCard, FiX, FiRotateCw, FiArrowLeft } from 'react-icons/fi';

interface Order {
  id: string;
  orderNumber: string;
  items: Array<{
    product: {
      name: string;
      images: string[];
      image?: string;
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login?callbackUrl=/orders');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session, status, router]);

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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-gradient-to-r from-green-600 to-green-700 text-white';
      case 'PENDING':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 'FAILED':
        return 'bg-gradient-to-r from-red-600 to-red-700 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
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

  const getPaymentIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'FAILED':
        return <FiX className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 25;
      case 'PROCESSING':
        return 50;
      case 'SHIPPED':
        return 75;
      case 'DELIVERED':
        return 100;
      case 'CANCELLED':
        return 0;
      default:
        return 0;
    }
  };

  if (status === 'loading' || loading) {
    return <LoadingPage />;
  }

  return (
    <div className="container mx-auto px-4 md:px-14 lg:px-20 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="border-t-4 border-red-600 mb-4"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Track and manage all your orders</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 text-sm md:text-base">
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 md:p-4 border border-blue-200">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-600 flex items-center justify-center">
                <FiPackage className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-blue-900">{orders.length}</p>
                <p className="text-xs md:text-sm text-blue-700">Total Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 md:p-4 border border-orange-200">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-orange-600 flex items-center justify-center">
                <FiRotateCw className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-orange-900">
                  {orders.filter(o => o.status === 'PROCESSING').length}
                </p>
                <p className="text-xs md:text-sm text-orange-700">Processing</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 md:p-4 border border-blue-200">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-600 flex items-center justify-center">
                <FiTruck className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-blue-900">
                  {orders.filter(o => o.status === 'SHIPPED').length}
                </p>
                <p className="text-xs md:text-sm text-blue-700">Shipped</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 md:p-4 border border-green-200">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-600 flex items-center justify-center">
                <FiCheckCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-green-900">
                  {orders.filter(o => o.status === 'DELIVERED').length}
                </p>
                <p className="text-xs md:text-sm text-green-700">Delivered</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center mb-4">
                <FiShoppingBag className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No orders yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start shopping to see your orders here
              </p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white hover:from-red-700 hover:via-red-800 hover:to-red-900">
                  <FiShoppingBag className="mr-2 h-4 w-4" />
                  Browse Products
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="border-gray-200 hover:border-red-500 shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer">
                <CardContent className="p-4 md:p-6">
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-4">
                    {/* Order Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                          <FiPackage className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">
                            #{order.orderNumber}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>

                    {/* Order Details */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiShoppingBag className="h-4 w-4" />
                        <span className="text-sm font-medium">{order.items.length} items</span>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold ${getPaymentStatusColor(
                        order.paymentStatus
                      )}`}>
                        {getPaymentIcon(order.paymentStatus)}
                        {order.paymentStatus}
                      </div>
                      <p className="text-lg font-bold text-red-600">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white hover:from-red-700 hover:via-red-800 hover:to-red-900 shadow-md text-sm">
                      View Details
                    </Button>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center flex-shrink-0">
                        <FiPackage className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Items Count */}
                    <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <FiShoppingBag className="h-5 w-5 text-gray-600" />
                        <span className="font-bold text-gray-900">{order.items.length}</span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-center px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-2xl font-bold text-red-600">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>

                    {/* Payment Status */}
                    <div className="text-center px-4 py-2">
                      <div className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm ${getPaymentStatusColor(
                        order.paymentStatus
                      )}`}>
                        {getPaymentIcon(order.paymentStatus)}
                        {order.paymentStatus}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>

                    {/* View Button */}
                    <Button className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white hover:from-red-700 hover:via-red-800 hover:to-red-900 shadow-md">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
