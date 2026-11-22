import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import {
  DollarSign,
  Users,
  Package,
  Activity,
  Plus,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardOverviewPage() {
  const session = await getSession();
  const user = session
    ? await prisma.user.findUnique({ where: { id: session.userId } })
    : null;

  const [paidOrders, totalOrders, activeProducts, totalCustomers, recentOrders] =
    await Promise.all([
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { totalAmount: true, createdAt: true },
      }),
      prisma.order.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.customer.count(),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: true,
        },
      }),
    ]);

  const totalRevenue = paidOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const conversionRate =
    totalOrders > 0 ? ((paidOrders.length / totalOrders) * 100).toFixed(2) : '0.00';
  const monthlyGoal = user?.monthlyGoal || 34000;
  const goalPct = Math.min(100, Math.round((totalRevenue / monthlyGoal) * 100));
  const remainingGoal = Math.max(0, monthlyGoal - totalRevenue);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyValues = new Array(12).fill(0);
  paidOrders.forEach((o) => {
    monthlyValues[new Date(o.createdAt).getMonth()] += o.totalAmount;
  });
  const maxBar = Math.max(...monthlyValues, 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs text-slate-400">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Welcome back, {user?.name.split(' ')[0] || 'Admin'} ✦
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Here&apos;s what&apos;s happening across your SaaS products, orders, and SSLCommerz payments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/checkout"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#141521] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/5"
          >
            <CreditCard size={16} className="text-violet-400" />
            SSLCommerz Checkout
          </Link>
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500"
          >
            <Plus size={16} />
            New Product
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.07] bg-[#12131d] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Revenue</span>
            <div className="rounded-lg bg-violet-500/15 p-2 text-violet-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white">
              ৳{totalRevenue.toLocaleString()}
            </div>
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
              ↗ Paid
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Verified via SSLCommerz</p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#12131d] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Customers</span>
            <div className="rounded-lg bg-violet-500/15 p-2 text-violet-400">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white">{totalCustomers}</div>
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
              ↗ CRM
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Registered customer profiles</p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#12131d] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Products</span>
            <div className="rounded-lg bg-violet-500/15 p-2 text-violet-400">
              <Package size={16} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white">{activeProducts}</div>
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
              ↗ Live
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Published SaaS plans & SKUs</p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#12131d] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Payment Conversion</span>
            <div className="rounded-lg bg-violet-500/15 p-2 text-violet-400">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white">{conversionRate}%</div>
            <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-xs font-medium text-violet-300">
              {paidOrders.length}/{totalOrders} orders
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Completed checkout ratio</p>
        </div>
      </div>

      {/* Revenue Overview & Goal Progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.07] bg-[#12131d] p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Revenue Overview</h2>
              <p className="text-xs text-slate-400">Monthly SSLCommerz settled revenue</p>
            </div>
            <span className="rounded-lg border border-white/10 bg-[#0b0c12] px-3 py-1.5 text-xs text-slate-300">
              Last 12 months
            </span>
          </div>

          <div className="mt-4 text-3xl font-bold text-white">
            ৳{totalRevenue.toLocaleString()}
          </div>

          {/* Bar chart */}
          <div className="mt-8 grid h-44 grid-cols-12 items-end gap-2 border-b border-white/[0.06] pb-3">
            {months.map((m, idx) => {
              const val = monthlyValues[idx];
              const heightPct = val > 0 ? Math.max(12, Math.round((val / maxBar) * 100)) : 6;
              return (
                <div key={m} className="flex h-full flex-col items-center justify-end gap-2">
                  <div
                    title={`${m}: ৳${val.toLocaleString()}`}
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[26px] rounded-t-md transition-all ${
                      val > 0 ? 'bg-violet-500 hover:bg-violet-400' : 'bg-white/[0.05]'
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 grid grid-cols-12 text-center text-[11px] text-slate-500">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* Goal Progress Ring */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-[#12131d] p-6">
          <div>
            <h2 className="text-base font-semibold text-white">Goal Progress</h2>
            <p className="text-xs text-slate-400">Monthly revenue target</p>
          </div>

          <div className="my-6 flex items-center justify-center">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[12px] border-violet-600/20">
              <div
                className="absolute inset-[-12px] rounded-full border-[12px] border-violet-500"
                style={{
                  clipPath: `inset(0 0 ${100 - goalPct}% 0)`,
                }}
              />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{goalPct}%</div>
                <div className="text-xs text-slate-400">of target</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm font-semibold text-white">
              ৳{totalRevenue.toLocaleString()} / ৳{monthlyGoal.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              ৳{remainingGoal.toLocaleString()} left to reach your goal
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#12131d] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Orders & Transactions</h2>
            <p className="text-xs text-slate-400">Live feed from orders & SSLCommerz callbacks</p>
          </div>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300"
          >
            View all orders <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] text-xs uppercase text-slate-400">
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Product</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3 pr-4">Payment</th>
                <th className="py-3">Transaction ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 pr-4 font-medium text-white">{order.orderNumber}</td>
                  <td className="py-3.5 pr-4">
                    <div className="text-white">{order.customer.name}</div>
                    <div className="text-xs text-slate-400">{order.customer.email}</div>
                  </td>
                  <td className="py-3.5 pr-4 text-slate-300">
                    {order.items[0]?.productName || 'SaaS Plan'}
                  </td>
                  <td className="py-3.5 pr-4 font-semibold text-white">
                    {order.currency} {order.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : order.paymentStatus === 'PENDING'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-xs text-slate-400">{order.tranId}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                    No orders yet. Create a test order via SSLCommerz Checkout.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
