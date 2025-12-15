'use client';

import { useEffect, useState } from 'react';
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
        const [productsRes, categoriesRes, subcategoriesRes, ordersRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/categories'),
          fetch('/api/admin/subcategories'),
          fetch('/api/admin/orders?limit=1000'),
        ]);

        const products = await productsRes.json();
        const categories = await categoriesRes.json();
        const subcategories = await subcategoriesRes.json();
        const ordersData = await ordersRes.json();
        const orders = ordersData.orders || [];

        const totalStock = products.reduce((sum: number, p: any) => sum + (p.stock || 0), 0);
        const visibleProducts = products.filter((p: any) => p.isVisible).length;
        const featuredProducts = products.filter((p: any) => p.featured).length;
        const outOfStock = products.filter((p: any) => p.stock === 0).length;

        const totalOrders = orders.length;
        const shippedOrders = orders.filter((o: any) => o.status === 'SHIPPED' || o.status === 'DELIVERED').length;
        const totalRevenue = orders
          .filter((o: any) => o.paymentStatus === 'PAID')
          .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
        const successfulPayments = orders.filter((o: any) => o.paymentStatus === 'PAID').length;

        setStats({
          products: products.length,
          categories: categories.length,
          subcategories: subcategories.length,
          totalStock,
          visibleProducts,
          featuredProducts,
          outOfStock,
          totalOrders,
          shippedOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          successfulPayments,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
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
    { title: 'Revenue (£)', value: stats.totalRevenue.toFixed(2), icon: '💰', color: 'bg-green-600' },
    { title: 'Paid Orders', value: stats.successfulPayments, icon: '✅', color: 'bg-lime-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-red-600 mb-2">Welcome to Lumo Admin</h1>
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
                  className="bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-xl transition-all transform hover:-translate-y-1"
                  style={{ borderLeftColor: '#DC2626' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div className="text-4xl bg-red-100 p-3 rounded-lg">{stat.icon}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-600">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href="/admin/products?action=new"
                  className="block p-3 bg-red-50 hover:bg-red-100 rounded text-red-600 font-semibold transition-colors border-l-4 border-red-600"
                >
                  + Add New Product
                </Link>
                <Link
                  href="/admin/categories?action=new"
                  className="block p-3 bg-red-50 hover:bg-red-100 rounded text-red-600 font-semibold transition-colors border-l-4 border-red-600"
                >
                  + Add New Category
                </Link>
                <Link
                  href="/admin/subcategories?action=new"
                  className="block p-3 bg-red-50 hover:bg-red-100 rounded text-red-600 font-semibold transition-colors border-l-4 border-red-600"
                >
                  + Add New Subcategory
                </Link>
                <Link
                  href="/admin/orders"
                  className="block p-3 bg-red-50 hover:bg-red-100 rounded text-red-600 font-semibold transition-colors border-l-4 border-red-600"
                >
                  📋 Manage Orders
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-600">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Store Info</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-sm">Store Name</p>
                  <p className="text-lg font-semibold text-gray-800">Lumo - Premium Gift Shop</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Status</p>
                  <p className="text-lg font-semibold text-red-600">🔴 Active</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
