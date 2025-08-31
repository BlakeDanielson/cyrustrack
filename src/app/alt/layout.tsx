'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo } from 'react';
import { BarChart3, Clock, Leaf, MapPin, Settings as SettingsIcon, NotebookPen, LayoutDashboard } from 'lucide-react';
import ClientInitializer from '@/components/ClientInitializer';

type AltLayoutProps = {
  children: ReactNode;
};

export default function AltLayout({ children }: AltLayoutProps) {
  const pathname = usePathname();

  const navItems = useMemo(
    () => [
      { href: '/alt', label: 'Overview', icon: LayoutDashboard },
      { href: '/alt/log', label: 'Log', icon: NotebookPen },
      { href: '/alt/history', label: 'History', icon: Clock },
      { href: '/alt/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/alt/settings', label: 'Settings', icon: SettingsIcon },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientInitializer />

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-white">
          <div className="px-6 py-5 border-b">
            <Link href="/" className="block">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                <span className="text-base font-semibold text-gray-900">Cannabis Tracker</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Alternative Dashboard</p>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={
                        `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ` +
                        (isActive
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900')
                      }
                    >
                      <Icon className={"h-4 w-4"} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="px-6 py-4 border-t text-xs text-gray-500">
            <p>Compare with original UI via the bottom nav.</p>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 pb-16 md:pb-0">
          {/* Top bar for mobile */}
          <header className="md:hidden sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Alternative Dashboard</span>
              </div>
              <Link href="/" className="text-xs text-green-700 hover:underline">Back to main</Link>
            </div>
          </header>

          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>

          {/* Bottom nav for mobile */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white/90 backdrop-blur border-t">
            <ul className="grid grid-cols-5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={
                        `flex flex-col items-center justify-center py-2 text-[11px] leading-tight transition-colors ` +
                        (isActive ? 'text-green-700' : 'text-gray-600 hover:text-gray-900')
                      }
                    >
                      <Icon className={"h-5 w-5 mb-0.5 " + (isActive ? 'text-green-700' : 'text-gray-500')} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

