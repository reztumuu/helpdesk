'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Globe, MessageSquare, BarChart, LogOut, Users, Settings, User, Menu, X } from 'lucide-react';
import UnreadBadge from '@/components/UnreadBadge';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xl font-bold text-blue-600">Helpdesk</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/profile" className="flex items-center gap-2 hover:opacity-80">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-600 text-sm">{(user?.name || 'U')[0]}</span>
                )}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="pt-14">
        <aside
          className={`fixed inset-y-14 left-0 z-30 w-72 bg-white border-r transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <nav className="py-4 h-full flex flex-col">
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between rounded-lg bg-blue-50 text-blue-700 px-4 py-3">
                <span className="font-medium">Menu</span>
              </div>
            </div>
            <div className="px-2 space-y-1">
              <Link href="/admin/dashboard" className={`flex items-center px-4 py-2.5 rounded-lg ${pathname === '/admin/dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
                <LayoutDashboard className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </Link>
              <Link href="/admin/websites" className={`flex items-center px-4 py-2.5 rounded-lg ${pathname.startsWith('/admin/websites') ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
                <Globe className="w-5 h-5 mr-3" />
                <span>Websites</span>
              </Link>
              <Link href="/admin/chats" className={`flex items-center px-4 py-2.5 rounded-lg ${pathname.startsWith('/admin/chats') ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
                <MessageSquare className="w-5 h-5 mr-3" />
                <span>Chats</span>
                <div className="ml-auto">
                  <UnreadBadge />
                </div>
              </Link>
              <Link href="/admin/analytics" className={`flex items-center px-4 py-2.5 rounded-lg ${pathname === '/admin/analytics' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
                <BarChart className="w-5 h-5 mr-3" />
                <span>Analytics</span>
              </Link>
              {user?.role === 'super_admin' && (
                <Link href="/admin/settings" className={`flex items-center px-4 py-2.5 rounded-lg ${pathname === '/admin/settings' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Settings className="w-5 h-5 mr-3" />
                  <span>Settings</span>
                </Link>
              )}
              {user?.role === 'super_admin' && (
                <Link href="/admin/admins" className={`flex items-center px-4 py-2.5 rounded-lg ${pathname.startsWith('/admin/admins') ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Users className="w-5 h-5 mr-3" />
                  <span>Admins</span>
                </Link>
              )}
              <Link href="/admin/profile" className={`flex items-center px-4 py-2.5 rounded-lg ${pathname === '/admin/profile' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
                <User className="w-5 h-5 mr-3" />
                <span>Profile</span>
              </Link>
            </div>
            <div className="mt-auto px-2 pb-4">
              <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100">
                <LogOut className="w-5 h-5 mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </aside>
        <main className="lg:pl-72">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
