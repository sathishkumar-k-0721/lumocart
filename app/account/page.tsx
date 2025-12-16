'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/ui/loading';
import { FiUser, FiLogOut } from 'react-icons/fi';

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login?callbackUrl=/account');
      return;
    }
  }, [session, status, router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return <LoadingPage />;
  }

  return (
    <div className="container mx-auto px-14 md:px-20 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <Button onClick={handleLogout} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
          <FiLogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-gray-200 shadow-md">
            <CardContent className="p-6">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200">
                  <FiUser className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="font-semibold text-gray-900">
                  {session?.user?.name || 'User'}
                </h2>
                <p className="text-sm text-gray-600">{session?.user?.email}</p>
              </div>

              <nav className="space-y-2">
                <div className="flex w-full items-center gap-3 rounded-lg px-4 py-2 bg-red-50 text-red-600">
                  <FiUser className="h-5 w-5" />
                  <span className="font-medium">Profile</span>
                </div>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="border-gray-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
              <CardTitle className="text-gray-900">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="text-gray-900 font-semibold">{session?.user?.name || 'N/A'}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="text-gray-900 font-semibold">{session?.user?.email || 'N/A'}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <p className="text-gray-900 font-semibold">
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
                    className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                    onClick={handleLogout}
                  >
                    <FiLogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
