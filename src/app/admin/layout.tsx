"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Globe,
  MessageSquare,
  BarChart,
  LogOut,
  Users,
  Settings,
  User,
  Menu,
  X,
  Terminal,
} from "lucide-react";
import UnreadBadge from "@/components/UnreadBadge";
import ThemeToggle from "@/components/ThemeToggle";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    const isPublicRoute =
      pathname === "/admin/login" || pathname === "/admin/signup";

    if (!token && !isPublicRoute) {
      router.push("/admin/login");
    } else if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  };

  const isPublicRoute =
    pathname === "/admin/login" || pathname === "/admin/signup";

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!user && !isPublicRoute) return null;

  return (
    <div
      className={`min-h-screen bg-background text-foreground ${display.className} selection:bg-foreground selection:text-background flex flex-col`}
    >
      <header className="sticky top-0 z-50 bg-background border-b-4 border-foreground h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-[0_4px_0_0_currentColor]">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-colors group"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
            ) : (
              <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-foreground bg-foreground text-background flex items-center justify-center">
              <MessageSquare className="w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-extrabold uppercase tracking-tighter hidden sm:block">
              BantuanQu_
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div
            className={`hidden md:flex items-center gap-2 border-2 border-foreground px-3 py-1 bg-foreground text-background text-xs font-bold uppercase tracking-widest ${mono.className}`}
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse border border-green-700" />
            Sys: Online
          </div>

          <Link
            href="/admin/profile"
            className="flex items-center gap-3 hover:-translate-y-0.5 transition-transform group"
          >
            <div className="hidden sm:flex flex-col items-end">
              <div className={`text-sm font-bold uppercase tracking-tight`}>
                {user?.name}
              </div>
              <div
                className={`text-[10px] uppercase font-bold tracking-widest bg-foreground text-background px-1.5 py-0.5 ${mono.className}`}
              >
                {user?.role?.replace("_", " ")}
              </div>
            </div>
            <div className="w-10 h-10 border-2 border-foreground rounded-none bg-background overflow-hidden flex items-center justify-center shadow-[4px_4px_0_0_currentColor] group-hover:shadow-[6px_6px_0_0_currentColor] transition-shadow">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              ) : (
                <span
                  className={`text-foreground text-lg font-bold ${mono.className}`}
                >
                  {(user?.name || "U")[0].toUpperCase()}
                </span>
              )}
            </div>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-background border-r-4 border-foreground transition-transform duration-300 ease-in-out flex flex-col ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4 border-b-2 border-foreground flex items-center justify-between bg-foreground text-background">
            <span
              className={`text-xs font-bold uppercase tracking-widest ${mono.className}`}
            >
              Navigation
            </span>
            <Terminal className="w-4 h-4" />
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
            {[
              {
                href: "/admin/dashboard",
                icon: LayoutDashboard,
                label: "Dashboard",
              },
              { href: "/admin/websites", icon: Globe, label: "Websites" },
              {
                href: "/admin/chats",
                icon: MessageSquare,
                label: "Chats",
                badge: (
                  <div className="ml-auto">
                    <UnreadBadge />
                  </div>
                ),
              },
              { href: "/admin/analytics", icon: BarChart, label: "Analytics" },
              ...(user?.role === "super_admin"
                ? [
                    {
                      href: "/admin/settings",
                      icon: Settings,
                      label: "Settings",
                    },
                    { href: "/admin/admins", icon: Users, label: "Admins" },
                  ]
                : []),
              { href: "/admin/profile", icon: User, label: "Profile" },
            ].map((item, i) => {
              const isActive =
                item.href === "/admin/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 border-2 border-foreground font-bold uppercase tracking-tight text-sm transition-all group ${
                    isActive
                      ? "bg-foreground text-background shadow-[4px_4px_0_0_currentColor] translate-y-[-2px]"
                      : "bg-background hover:bg-foreground hover:text-background hover:-translate-y-1 hover:shadow-[4px_4px_0_0_currentColor]"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t-2 border-foreground bg-background">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center px-4 py-3 border-2 border-red-500 bg-red-50 text-red-600 font-bold uppercase tracking-widest text-sm hover:bg-red-500 hover:text-white transition-colors group ${mono.className} shadow-[4px_4px_0_0_currentColor] hover:-translate-y-1`}
            >
              <LogOut className="w-4 h-4 mr-3 shrink-0" />
              <span>Terminate Session</span>
            </button>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
