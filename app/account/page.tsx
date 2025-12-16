'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import toast from 'react-hot-toast';
import { FiPackage, FiUser, FiLogOut, FiClock, FiCheckCircle, FiTruck, FiShoppingBag, FiMapPin, FiCreditCard, FiX, FiRotateCw } from 'react-icons/fi';

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

  if (status === 'loading' || loading) {
    return <LoadingPage />;
  }

  return (
    <div className="container mx-auto px-14 md:px-20 py-8">
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
            <div>
              <div className="mb-6">
                <div className="border-t-4 border-red-600 mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
                <p className="text-gray-600 mt-1">Track and manage your orders</p>
              </div>

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
                <div className="space-y-6">
                  {orders.map((order) => (
                    <Card
                      key={order.id}
                      className="border-gray-200 hover:border-red-500 shadow-md hover:shadow-xl transition-all overflow-hidden"
                    >
                      {/* Order Header with Gradient */}
                      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-6 py-4 text-white">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                              <FiPackage className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold">
                                Order #{order.orderNumber}
                              </h3>
                              <p className="text-red-100 text-sm">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-semibold ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                          {/* Order Items Section */}
                          <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                              <FiShoppingBag className="h-5 w-5 text-red-600" />
                              <span>Items Ordered ({order.items.length})</span>
                            </div>
                            
                            <div className="space-y-3">
                              {order.items.slice(0, 3).map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                  <div className="h-16 w-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {(item.product.images?.[0] || item.product.image) ? (
                                      <img
                                        src={item.product.images?.[0] || item.product.image}
                                        alt={item.product.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <FiPackage className="h-8 w-8 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">
                                      {item.product.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900">
                                      ₹{(item.quantity * item.price).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              
                              {order.items.length > 3 && (
                                <div className="text-center py-2 text-sm text-gray-600">
                                  +{order.items.length - 3} more item(s)
                                </div>
                              )}
                            </div>

                            {/* Shipping Address */}
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2 text-blue-900 font-semibold mb-2">
                                <FiMapPin className="h-4 w-4" />
                                <span className="text-sm">Delivery Address</span>
                              </div>
                              <div className="text-sm text-blue-800">
                                <p className="font-medium">{order.shippingAddress.fullName}</p>
                                <p>{order.shippingAddress.addressLine1}</p>
                                <p>
                                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                </p>
                                <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
                              </div>
                            </div>
                          </div>

                          {/* Summary Section */}
                          <div className="space-y-4">
                            {/* Payment Status */}
                            <div className="rounded-lg border border-gray-200 p-4 bg-white">
                              <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                                <FiCreditCard className="h-5 w-5 text-red-600" />
                                <span>Payment</span>
                              </div>
                              <div className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm ${getPaymentStatusColor(
                                order.paymentStatus
                              )}`}>
                                {getPaymentIcon(order.paymentStatus)}
                                {order.paymentStatus}
                              </div>
                            </div>

                            {/* Order Total */}
                            <div className="rounded-lg border border-gray-200 p-4 bg-white">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                  <span>Subtotal</span>
                                  <span>₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>Delivery</span>
                                  <span className="text-green-600 font-medium">FREE</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between items-center">
                                  <span className="font-semibold text-gray-900">Total</span>
                                  <span className="text-2xl font-bold text-red-600">
                                    ₹{order.totalAmount.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <Link href={`/orders/${order.id}`} className="block">
                              <Button className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white hover:from-red-700 hover:via-red-800 hover:to-red-900 shadow-md">
                                View Full Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
