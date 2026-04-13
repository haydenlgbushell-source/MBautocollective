'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/inventory', label: 'Inventory', icon: '◉' },
  { href: '/admin/inventory/new', label: 'Add Vehicle', icon: '+' },
  { href: '/admin/leads', label: 'Leads / CRM', icon: '◎' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen max-md:grid-cols-1">
      {/* Sidebar */}
      <aside className="bg-bg-2 border-r border-border py-8 sticky top-0 h-screen overflow-y-auto max-md:hidden">
        <div className="px-7 pb-8 border-b border-border mb-6">
          <div className="font-display text-[18px]">
            MB <span className="text-gold">Auto</span> Collective
          </div>
          <div className="font-mono-custom text-[8px] tracking-[0.25em] uppercase text-text-3 mt-1">
            Admin Dashboard
          </div>
        </div>

        <nav>
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const isActive =
              href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(href) && href !== '/admin';
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-7 py-3 text-[12px] tracking-[0.1em] transition-all duration-200 no-underline border-l-2 ${
                  isActive
                    ? 'text-gold border-l-gold bg-[rgba(201,168,76,0.04)]'
                    : 'text-text-2 border-l-transparent hover:text-gold hover:bg-[rgba(201,168,76,0.04)]'
                }`}
              >
                <span className="text-[14px]">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-7 pt-8 border-t border-border absolute bottom-0 left-0 right-0">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full text-left font-body text-[11px] tracking-[0.15em] uppercase text-text-3 hover:text-text-2 transition-colors py-3 disabled:opacity-50"
          >
            {loggingOut ? 'Signing out...' : '← Sign Out'}
          </button>
          <Link
            href="/"
            className="block font-body text-[11px] tracking-[0.15em] uppercase text-text-3 hover:text-text-2 transition-colors no-underline py-2"
          >
            ↗ View Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="bg-bg min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
