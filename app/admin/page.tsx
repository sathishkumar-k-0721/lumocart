'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface DashboardStats {
  products: number;
  categories: number;
  subcategories: number;
  totalStock: number;
  visibleProducts: number;
  featuredProducts: number;
  outOfStock: number;
  totalOrders: number;
  shippedOrders: number;
  totalRevenue: number;
  successfulPayments: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    categories: 0,
    subcategories: 0,
    totalStock: 0,
    visibleProducts: 0,
    featuredProducts: 0,
    outOfStock: 0,
    totalOrders: 0,
    shippedOrders: 0,
    totalRevenue: 0,
    successfulPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await fetch('/api/admin/stats');
        
        if (!statsRes.ok) {
          console.error('Stats fetch failed:', statsRes.status);
          return;
        }

        const statsData = await statsRes.json();
        console.log('Dashboard stats:', statsData);

        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Products', value: stats.products, icon: '📦', color: 'bg-blue-500' },
    { title: 'Categories', value: stats.categories, icon: '📂', color: 'bg-green-500' },
    { title: 'Subcategories', value: stats.subcategories, icon: '📑', color: 'bg-purple-500' },
    { title: 'Total Stock', value: stats.totalStock, icon: '📊', color: 'bg-orange-500' },
    { title: 'Visible Products', value: stats.visibleProducts, icon: '👁️', color: 'bg-cyan-500' },
    { title: 'Featured', value: stats.featuredProducts, icon: '⭐', color: 'bg-yellow-500' },
    { title: 'Out of Stock', value: stats.outOfStock, icon: '🚫', color: 'bg-red-500' },
    { title: 'Total Orders', value: stats.totalOrders, icon: '📋', color: 'bg-indigo-500' },
    { title: 'Shipped', value: stats.shippedOrders, icon: '🚚', color: 'bg-pink-500' },
    { title: 'Revenue (₹)', value: stats.totalRevenue.toFixed(2), icon: '💰', color: 'bg-green-600' },
    { title: 'Paid Orders', value: stats.successfulPayments, icon: '✅', color: 'bg-lime-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-red-600 mb-2">
          Welcome, {session?.user?.name || 'Admin'}!
        </h1>
        <p className="text-gray-600">Manage your e-commerce store</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-xl font-semibold">Loading...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const colorMap: Record<string, string> = {
                'bg-red-500': '#DC2626',
                'bg-red-600': '#E11D48',
                'bg-white': '#FFFFFF',
                'bg-green-500': '#10B981',
                'bg-blue-500': '#3B82F6',
                'bg-purple-500': '#8B5CF6',
                'bg-orange-500': '#F97316',
                'bg-cyan-500': '#06B6D4',
                'bg-yellow-500': '#EAB308',
                'bg-indigo-500': '#6366F1',
                'bg-pink-500': '#EC4899',
                'bg-lime-500': '#84CC16',
              };
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl p-6 border border-gray-200 hover:border-red-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-red-600 transition-colors">{stat.value}</p>
                    </div>
                    <div className="text-4xl bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl group-hover:from-red-100 group-hover:to-red-200 transition-all duration-300 transform group-hover:scale-110">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="mt-4 h-1 bg-gradient-to-r from-red-200 via-red-300 to-red-200 rounded-full group-hover:from-red-500 group-hover:via-red-600 group-hover:to-red-500 transition-all duration-300"></div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md hover:shadow-2xl p-6 border border-gray-200 hover:border-red-500 transition-all duration-300">
              <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="w-1 h-6 bg-red-600 mr-3 rounded-full"></span>
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/admin/products?action=new"
                  className="block p-4 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-lg text-red-700 font-semibold transition-all duration-300 border-l-4 border-red-600 hover:border-red-700 transform hover:translate-x-1 hover:shadow-md"
                >
                  + Add New Product
                </Link>
                <Link
                  href="/admin/categories?action=new"
                  className="block p-4 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-lg text-red-700 font-semibold transition-all duration-300 border-l-4 border-red-600 hover:border-red-700 transform hover:translate-x-1 hover:shadow-md"
                >
                  + Add New Category
                </Link>
                <Link
                  href="/admin/subcategories?action=new"
                  className="block p-4 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-lg text-red-700 font-semibold transition-all duration-300 border-l-4 border-red-600 hover:border-red-700 transform hover:translate-x-1 hover:shadow-md"
                >
                  + Add New Subcategory
                </Link>
                <Link
                  href="/admin/orders"
                  className="block p-4 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-lg text-red-700 font-semibold transition-all duration-300 border-l-4 border-red-600 hover:border-red-700 transform hover:translate-x-1 hover:shadow-md"
                >
                  📋 Manage Orders
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-2xl p-6 border border-gray-200 hover:border-red-500 transition-all duration-300">
              <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="w-1 h-6 bg-red-600 mr-3 rounded-full"></span>
                Store Info
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-l-4 border-red-600">
                  <p className="text-gray-500 text-sm font-medium">Store Name</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">Lumo - Premium Gift Shop</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-l-4 border-green-600">
                  <p className="text-gray-500 text-sm font-medium">Status</p>
                  <p className="text-lg font-semibold text-green-700 mt-1 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Active
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
