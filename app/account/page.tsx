'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import toast from 'react-hot-toast';
import { FiPackage, FiUser, FiLogOut, FiClock, FiCheckCircle, FiTruck } from 'react-icons/fi';

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    product: {
      name: string;
      images: string[];
    };
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'orders' | 'profile'>('orders');

  React.useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login?callbackUrl=/account');
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

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || loading) {
    return <LoadingPage />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-600 bg-green-50';
      case 'SHIPPED':
        return 'text-blue-600 bg-blue-50';
      case 'PROCESSING':
        return 'text-yellow-600 bg-yellow-50';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-50';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50';
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <FiCheckCircle className="h-5 w-5" />;
      case 'SHIPPED':
        return <FiTruck className="h-5 w-5" />;
      case 'PROCESSING':
        return <FiClock className="h-5 w-5" />;
      default:
        return <FiPackage className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <Button onClick={handleLogout} variant="outline">
          <FiLogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                  <FiUser className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="font-semibold text-gray-900">
                  {session?.user?.name || 'User'}
                </h2>
                <p className="text-sm text-gray-600">{session?.user?.email}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FiPackage className="h-5 w-5" />
                  My Orders
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FiUser className="h-5 w-5" />
                  Profile
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="py-12 text-center">
                      <FiPackage className="mx-auto h-16 w-16 text-gray-300" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">
                        No orders yet
                      </h3>
                      <p className="mt-2 text-gray-600">
                        Start shopping to see your orders here
                      </p>
                      <Button
                        onClick={() => router.push('/products')}
                        className="mt-6"
                      >
                        Browse Products
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md"
                        >
                          {/* Order Header */}
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Order #{order.orderNumber}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getPaymentStatusColor(
                                  order.paymentStatus
                                )}`}
                              >
                                {order.paymentStatus}
                              </span>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="mb-4 space-y-2">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 text-sm"
                              >
                                <span className="text-gray-600">
                                  {item.product.name}
                                </span>
                                <span className="text-gray-400">×</span>
                                <span className="text-gray-600">{item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          {/* Order Footer */}
                          <div className="flex items-center justify-between border-t pt-4">
                            <div>
                              <span className="text-sm text-gray-600">Total: </span>
                              <span className="text-lg font-bold text-gray-900">
                                ₹{order.total.toFixed(2)}
                              </span>
                            </div>
                            <Link href={`/orders/${order._id}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <p className="text-gray-900">{session?.user?.name || 'N/A'}</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="text-gray-900">{session?.user?.email || 'N/A'}</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Account Type
                  </label>
                  <p className="text-gray-900">
                    {session?.user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                  </p>
                </div>

                {session?.user?.role === 'ADMIN' && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                      You have administrator privileges.{' '}
                      <Link href="/admin" className="font-medium underline">
                        Go to Admin Dashboard
                      </Link>
                    </p>
                  </div>
                )}

                <div className="border-t pt-6">
                  <h3 className="mb-4 font-semibold text-gray-900">
                    Account Actions
                  </h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <FiLogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
