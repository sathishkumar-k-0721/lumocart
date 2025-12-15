'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You must be logged in as an admin</p>
          <Link href="/login" className="text-blue-600 hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Red Theme */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-red-600 to-red-700 text-white transition-all duration-300 flex flex-col shadow-lg`}
      >
        <div className="p-4 border-b border-red-500 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">🎁 Lumo Admin</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-red-700 rounded transition-colors"
          >
            ☰
          </button>
        </div>

        <nav className="flex-1 p-4">
          <NavItem
            href="/admin"
            icon="📊"
            label="Dashboard"
            sidebarOpen={sidebarOpen}
          />
          <NavItem
            href="/admin/categories"
            icon="📂"
            label="Categories"
            sidebarOpen={sidebarOpen}
          />
          <NavItem
            href="/admin/subcategories"
            icon="📑"
            label="Subcategories"
            sidebarOpen={sidebarOpen}
          />
          <NavItem
            href="/admin/products"
            icon="📦"
            label="Products"
            sidebarOpen={sidebarOpen}
          />
          <NavItem
            href="/admin/orders"
            icon="📋"
            label="Orders"
            sidebarOpen={sidebarOpen}
          />
          <NavItem
            href="/"
            icon="🏠"
            label="View Store"
            sidebarOpen={sidebarOpen}
          />
        </nav>

        <div className="p-4 border-t border-red-500">
          <div className="mb-3">
            {sidebarOpen && (
              <p className="text-sm text-red-100 mb-1">
                Logged in as:
              </p>
            )}
            {sidebarOpen && (
              <p className="text-sm font-semibold truncate">
                {session.user?.email}
              </p>
            )}
          </div>
          <button
            onClick={() => signOut({ redirect: true })}
            className={`w-full p-2 text-sm font-semibold rounded transition-colors ${
              sidebarOpen ? 'bg-red-500 hover:bg-red-800' : 'hover:bg-red-700'
            }`}
          >
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md p-6 border-b-4 border-red-600">
          <h2 className="text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h2>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  sidebarOpen,
}: {
  href: string;
  icon: string;
  label: string;
  sidebarOpen: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 p-3 rounded hover:bg-red-500 transition-colors mb-2 hover:shadow-md"
    >
      <span className="text-xl">{icon}</span>
      {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
}
