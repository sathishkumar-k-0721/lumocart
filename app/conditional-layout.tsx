'use client';

import { usePathname } from 'next/navigation';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if current route is admin
  const isAdminRoute = pathname?.startsWith('/admin');

  // For admin routes, render children without header/footer
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // For regular routes, render with header and footer
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
