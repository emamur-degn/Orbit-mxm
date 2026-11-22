'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Package,
  PlusCircle,
  ShoppingBag,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Activity,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
    workspace: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutGrid },
    { label: 'Products', href: '/dashboard/products', icon: Package },
    { label: 'Add Product', href: '/dashboard/products/new', icon: PlusCircle },
    { label: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { label: 'Customers', href: '/dashboard/customers', icon: Users },
    { label: 'SSLCommerz Checkout', href: '/dashboard/checkout', icon: CreditCard },
  ];

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-white/[0.07] bg-[#0d0e16] px-4 py-6">
      <div>
        {/* Brand */}
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/30">
            <Activity size={18} />
          </div>
          <div>
            <div className="text-base font-bold leading-tight text-white">Orbit.</div>
            <div className="text-[11px] text-slate-400">{user.workspace}</div>
          </div>
        </div>

        {/* Workspace Section */}
        <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Workspace
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href ||
                  (item.href !== '/dashboard/products' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* General Section */}
        <div className="mb-2 mt-8 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          General
        </div>
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            pathname === '/dashboard/settings'
              ? 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30'
              : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
          }`}
        >
          <Settings size={17} />
          <span>API & Gateway Config</span>
        </Link>
      </div>

      <div className="space-y-4">
        {/* SSLCommerz Status Card */}
        <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-950/40 to-[#131420] p-4">
          <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/30 text-violet-300">
            <Zap size={14} />
          </div>
          <div className="text-xs font-semibold text-white">SSLCommerz Active</div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            IPN webhook & validation API ready for BDT/USD transactions.
          </p>
          <Link
            href="/dashboard/checkout"
            className="mt-3 block w-full rounded-lg bg-violet-600 py-1.5 text-center text-xs font-semibold text-white transition hover:bg-violet-500"
          >
            Test Checkout ↗
          </Link>
        </div>

        {/* User Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.07] pt-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-xs font-bold text-violet-200">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="truncate text-xs font-semibold text-white">{user.name}</div>
              <div className="truncate text-[11px] text-slate-400">{user.role} account</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
