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
  const [cartItemCount, setCartItemCount] = React.useState(0);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full transition-all duration-300",
      scrolled 
        ? "bg-white/95 backdrop-blur shadow-lg border-b border-red-200" 
        : "bg-gradient-to-r from-red-50 via-white to-red-50 border-b border-gray-100"
    )}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 group">
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent group-hover:from-red-700 group-hover:to-red-900 transition-all duration-300 transform group-hover:scale-105 inline-block">
              LumoCart
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:bg-red-100 transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <FiX className="h-6 w-6 transition-transform duration-200 rotate-90" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'relative px-4 py-2 font-semibold rounded-lg transition-all duration-300 group',
                pathname === item.href 
                  ? 'text-red-600 text-lg scale-105' 
                  : 'text-gray-700 hover:text-red-600 text-base hover:scale-110'
              )}
            >
              {item.name}
              <span className={cn(
                "absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-600 to-red-800 transform transition-all duration-300",
                pathname === item.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              )} />
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-4">
          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative hover:bg-red-100 hover:text-red-600 transition-all duration-300 group">
              <FiShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              {cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-800 text-xs text-white animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* User menu */}
          {status === 'loading' ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-gradient-to-r from-red-200 to-red-300" />
          ) : session ? (
            <div className="flex items-center gap-2">
              {session.user.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-600 transition-all duration-300 group">
                    <FiPackage className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="ml-1">Admin</span>
                  </Button>
                </Link>
              )}
              <Link href="/account">
                <Button variant="ghost" size="icon" className="hover:bg-red-100 hover:text-red-600 transition-all duration-300 group">
                  <FiUser className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                title="Sign out"
                className="hover:bg-red-100 hover:text-red-600 transition-all duration-300 group"
              >
                <FiLogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-red-50 hover:text-red-600 transition-all duration-300">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden animate-in slide-in-from-top duration-300">
          <div className="space-y-1 px-4 pb-3 pt-2 bg-gradient-to-b from-red-50 to-white">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'block rounded-lg px-3 py-2 text-base font-medium transition-all duration-300',
                  pathname === item.href
                    ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-md'
                    : 'text-gray-700 hover:bg-red-100 hover:text-red-600'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-red-200 px-4 py-3 bg-white">
            {session ? (
              <div className="space-y-2">
                <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start border-red-300 hover:bg-red-50 hover:border-red-600 transition-all duration-300">
                    <FiUser className="mr-2 h-4 w-4" />
                    My Account
                  </Button>
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start border-red-300 hover:bg-red-50 hover:border-red-600 transition-all duration-300">
                      <FiPackage className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-red-50 hover:text-red-600 transition-all duration-300"
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
                  <Button variant="outline" className="w-full border-red-300 hover:bg-red-50 hover:border-red-600 transition-all duration-300">
                    Log in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 transition-all duration-300">
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
