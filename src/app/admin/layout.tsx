'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Globe, MessageSquare, BarChart, LogOut, Users, Settings, User } from 'lucide-react';
import UnreadBadge from '@/components/UnreadBadge';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!user && pathname !== '/admin/login') return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">Helpdesk</h1>
        </div>
        <nav className="mt-6">
          <Link href="/admin/dashboard" className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${pathname === '/admin/dashboard' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link href="/admin/websites" className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${pathname.startsWith('/admin/websites') ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''}`}>
            <Globe className="w-5 h-5 mr-3" />
            Websites
          </Link>
          <Link href="/admin/chats" className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${pathname.startsWith('/admin/chats') ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''}`}>
            <MessageSquare className="w-5 h-5 mr-3" />
            Chats
            <UnreadBadge />
          </Link>
          <Link href="/admin/analytics" className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${pathname === '/admin/analytics' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''}`}>
            <BarChart className="w-5 h-5 mr-3" />
            Analytics
          </Link>
          {user?.role === 'super_admin' && (
            <Link href="/admin/settings" className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${pathname === '/admin/settings' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''}`}>
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </Link>
          )}
          {user?.role === 'super_admin' && (
            <Link href="/admin/admins" className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${pathname.startsWith('/admin/admins') ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''}`}>
              <Users className="w-5 h-5 mr-3" />
              Admins
            </Link>
          )}
          <Link href="/admin/profile" className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${pathname === '/admin/profile' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''}`}>
            <User className="w-5 h-5 mr-3" />
            Profile
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 mt-auto">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
