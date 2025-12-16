'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navbar */}
      <nav className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <Link href="/admin" className="flex items-center hover:opacity-90 transition-opacity">
              <span className="text-xl md:text-2xl font-bold">LumoCart</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              <NavLink href="/admin" icon="📊" label="Dashboard" active={pathname === '/admin'} />
              <NavLink href="/admin/categories" icon="📂" label="Categories" active={pathname === '/admin/categories'} />
              <NavLink href="/admin/subcategories" icon="📑" label="Subcategories" active={pathname === '/admin/subcategories'} />
              <NavLink href="/admin/products" icon="📦" label="Products" active={pathname === '/admin/products'} />
              <NavLink href="/admin/orders" icon="📋" label="Orders" active={pathname === '/admin/orders'} />
            </div>

            {/* Desktop User Account Dropdown */}
            <div className="hidden md:block relative">
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

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-red-800 hover:bg-red-900 transition-all transform active:scale-95"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`h-0.5 w-full bg-white rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`h-0.5 w-full bg-white rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`h-0.5 w-full bg-white rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Slide-out Menu */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-red-600 to-red-800 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl`}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="p-6 border-b border-red-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-red-700 hover:bg-red-800 transition-colors"
              >
                <span className="text-white text-2xl">×</span>
              </button>
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-3 bg-red-700 rounded-lg p-3">
              <div className="w-12 h-12 bg-white text-red-600 rounded-full flex items-center justify-center font-bold text-xl">
                {session.user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{session.user?.name || 'Admin'}</p>
                <p className="text-xs text-red-200 truncate">{session.user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-white text-red-600 text-xs font-semibold rounded">
                  ADMIN
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <MobileNavLink href="/admin" label="Dashboard" active={pathname === '/admin'} />
            <MobileNavLink href="/admin/categories" label="Categories" active={pathname === '/admin/categories'} />
            <MobileNavLink href="/admin/subcategories" label="Subcategories" active={pathname === '/admin/subcategories'} />
            <MobileNavLink href="/admin/products" label="Products" active={pathname === '/admin/products'} />
            <MobileNavLink href="/admin/orders" label="Orders" active={pathname === '/admin/orders'} />
            <div className="border-t border-red-700 my-4"></div>
            <MobileNavLink href="/account" label="User Account" active={pathname === '/account'} />
          </div>

          {/* Logout Button */}
          <div className="p-6 border-t border-red-700">
            <button
              onClick={() => signOut({ redirect: true })}
              className="w-full flex items-center justify-center space-x-2 bg-red-900 hover:bg-red-950 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="max-w-full mx-auto px-14 md:px-20 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-red-700 to-red-600 shadow-2xl z-30 border-t-2 border-red-800">
        <div className="grid grid-cols-5 gap-1 px-2 py-3">
          <MobileBottomNavLink href="/admin" label="Dashboard" active={pathname === '/admin'} />
          <MobileBottomNavLink href="/admin/categories" label="Categories" active={pathname === '/admin/categories'} />
          <MobileBottomNavLink href="/admin/products" label="Products" active={pathname === '/admin/products'} />
          <MobileBottomNavLink href="/admin/orders" label="Orders" active={pathname === '/admin/orders'} />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center text-white hover:text-red-100 transition-colors px-2 py-2 rounded-lg hover:bg-red-700"
          >
            <span className="text-xs font-medium">Menu</span>
          </button>
        </div>
      </div>
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

function MobileNavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center px-6 py-3 mx-4 my-1 rounded-lg font-light transition-all duration-300 ${
        active
          ? 'bg-white text-red-600 shadow-lg text-lg scale-105'
          : 'hover:bg-white/90 hover:text-red-600 text-base hover:scale-105 text-white'
      }`}
    >
      <span>{label}</span>
    </Link>
  );
}

function MobileBottomNavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-center px-2 py-2 rounded-lg font-light transition-all duration-300 ${
        active
          ? 'bg-white text-red-600 shadow-lg text-sm scale-105'
          : 'hover:bg-white/90 hover:text-red-600 text-xs hover:scale-105 text-white'
      }`}
    >
      <span className="truncate max-w-full">{label}</span>
    </Link>
  );
}
