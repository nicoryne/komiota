'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Route,
  Users,
  Shield,
  Award,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  userRole: 'admin' | 'moderator';
  username: string;
  onLogout: () => void;
}

const adminRoutes = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/bus-stops', label: 'Bus Stops', icon: MapPin },
  { href: '/dashboard/routes', label: 'Routes', icon: Route },
  { href: '/dashboard/accounts', label: 'Accounts', icon: Users },
  { href: '/dashboard/factions', label: 'Factions', icon: Shield },
  { href: '/dashboard/badges', label: 'Badges', icon: Award },
];

const moderatorRoutes = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/bus-stops', label: 'Bus Stops', icon: MapPin },
];

export function Sidebar({ userRole, username, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const routes = userRole === 'admin' ? adminRoutes : moderatorRoutes;

  return (
    <aside className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="flex flex-col gap-6 p-6">
        {/* Brand */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-[#4627b6]">Komiota</h1>
          <p className="text-xs text-gray-600">Dashboard</p>
        </div>

        {/* User Info */}
        <div className="flex flex-col gap-1 p-3 bg-[#FAFAFA] rounded-[12px] border border-gray-200">
          <p className="text-sm font-medium text-[#1C1A22]">{username}</p>
          <p className="text-xs text-gray-600 capitalize">{userRole}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);

            return (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-[12px] text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#4627b6] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {route.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start gap-3 text-gray-700 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
