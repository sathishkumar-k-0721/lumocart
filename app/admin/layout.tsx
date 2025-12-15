'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold mb-4 text-red-600">Access Denied</h1>
          <p className="mb-6 text-gray-600">You must be logged in as an admin</p>
          <Link href="/login" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navbar */}
      <nav className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <Link href="/admin" className="flex items-center hover:opacity-90 transition-opacity">
              <span className="text-2xl font-bold">LumoCart</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              <NavLink href="/admin" icon="📊" label="Dashboard" active={pathname === '/admin'} />
              <NavLink href="/admin/categories" icon="📂" label="Categories" active={pathname === '/admin/categories'} />
              <NavLink href="/admin/subcategories" icon="📑" label="Subcategories" active={pathname === '/admin/subcategories'} />
              <NavLink href="/admin/products" icon="📦" label="Products" active={pathname === '/admin/products'} />
              <NavLink href="/admin/orders" icon="📋" label="Orders" active={pathname === '/admin/orders'} />
              <NavLink href="/" icon="🏠" label="View Store" active={false} />
            </div>

            {/* User Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 bg-red-800 hover:bg-red-900 px-4 py-2 rounded-lg transition-colors"
              >
                <div className="w-9 h-9 bg-white text-red-600 rounded-full flex items-center justify-center font-bold text-lg">
                  {session.user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold">{session.user?.name || 'Admin'}</p>
                  <p className="text-xs text-red-200">{session.user?.email}</p>
                </div>
                <span className="text-xl">▼</span>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-700">{session.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded">
                      ADMIN
                    </span>
                  </div>
                  <Link
                    href="/account"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span className="mr-2">👤</span> User Account
                  </Link>
                  <button
                    onClick={() => signOut({ redirect: true })}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="mr-2">🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-2 rounded-lg font-light transition-all duration-300 ${
        active
          ? 'bg-white text-red-600 shadow-lg text-lg scale-105'
          : 'hover:bg-white/90 hover:text-red-600 text-base hover:scale-110'
      }`}
    >
      <span>{label}</span>
    </Link>
  );
}
