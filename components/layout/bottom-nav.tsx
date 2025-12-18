'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiShoppingBag, FiShoppingCart, FiPackage, FiUser } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Category', href: '/products', icon: FiShoppingBag },
    { name: 'Cart', href: '/cart', icon: FiShoppingCart },
    { name: 'Orders', href: '/orders', icon: FiPackage },
    { name: 'Account', href: session ? '/account' : '/login', icon: FiUser },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg pb-safe">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-red-600'
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${active ? 'stroke-2' : ''}`} />
              <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
