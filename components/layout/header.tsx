'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '../ui/button';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage } from 'react-icons/fi';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [cartItemCount, setCartItemCount] = React.useState(0);
  const fetchingRef = React.useRef(false);

  // Fetch cart count with debouncing
  const fetchCartCount = React.useCallback(async () => {
    if (!session || fetchingRef.current) return;
    
    fetchingRef.current = true;
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        const count = data.cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
        setCartItemCount(count);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      fetchingRef.current = false;
    }
  }, [session]);

  // Single consolidated useEffect for all cart updates
  React.useEffect(() => {
    if (!session) {
      setCartItemCount(0);
      return;
    }

    fetchCartCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [session, fetchCartCount]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Category', href: '/products' },
    { name: 'Orders', href: '/orders' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 py-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="mr-8">
            <span className="text-xl md:text-2xl font-bold hover:opacity-90 transition-opacity">
              LumoCart
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-2 rounded-lg font-light transition-all duration-300',
                  pathname === item.href
                    ? 'bg-white text-red-600 shadow-lg text-lg scale-105'
                    : 'hover:bg-white/90 hover:text-red-600 text-base hover:scale-110'
                )}
              >
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2.5 hover:bg-red-800 transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Right side - Cart and Account */}
        <div className="hidden md:flex items-center gap-2">
          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative hover:bg-white hover:text-red-600 text-white transition-all duration-300">
              <FiShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-red-600 text-xs font-bold">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* User Account Dropdown */}
          {status === 'loading' ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-red-800" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 hover:bg-white hover:text-red-600 px-4 py-2 rounded-lg transition-colors group"
              >
                <div className="w-9 h-9 bg-white text-red-600 rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                  {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden lg:block text-left text-white group-hover:text-red-600 transition-colors">
                  <p className="text-sm font-semibold">{session.user?.name || 'User'}</p>
                  <p className="text-xs opacity-80">{session.user?.email}</p>
                </div>
                <span className="text-xl text-white group-hover:text-red-600 transition-colors">▼</span>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-700">{session.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                    {session.user.role === 'ADMIN' && (
                      <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <Link
                    href="/account"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <FiUser className="mr-2" /> My Account
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <FiPackage className="mr-2" /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut({ redirect: true });
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut className="mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-red-800 text-white transition-all duration-300">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-white text-red-600 hover:bg-gray-100 shadow-lg transition-all duration-300">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-red-700">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'block px-4 py-3 font-semibold rounded-lg transition-all duration-200',
                  pathname === item.href
                    ? 'bg-red-800 text-white'
                    : 'text-white hover:bg-red-800'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-red-800 px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-red-800">
                  <FiShoppingCart className="mr-2 h-4 w-4" />
                  Cart
                  {cartItemCount > 0 && (
                    <span className="ml-auto bg-white text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
            {session ? (
              <div className="space-y-2">
                <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-white hover:bg-red-800">
                    <FiUser className="mr-2 h-4 w-4" />
                    My Account
                  </Button>
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-red-800">
                      <FiPackage className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-red-800"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <FiLogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-white hover:bg-red-800">
                    Log in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-white text-red-600 hover:bg-gray-100">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
