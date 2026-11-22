import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { CreditCard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { payment?: string; orderNumber?: string; tranId?: string };
}) {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders & Payment Status</h1>
          <p className="text-sm text-slate-400">
            Track customer orders, SSLCommerz validation IDs, and settlement states.
          </p>
        </div>
        <Link
          href="/dashboard/checkout"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          <CreditCard size={16} />
          New Order / SSLCommerz Pay
        </Link>
      </div>

      {/* Callback Banner */}
      {searchParams.payment === 'success' && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          ✓ SSLCommerz payment validated and confirmed for order{' '}
          <strong>{searchParams.orderNumber}</strong>!
        </div>
      )}
      {searchParams.payment === 'failed' && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          ✕ Payment failed for transaction <strong>{searchParams.tranId}</strong>.
        </div>
      )}
      {searchParams.payment === 'cancelled' && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          ! Customer cancelled the SSLCommerz checkout session ({searchParams.tranId}).
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12131d]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] bg-[#0e0f17] text-xs uppercase text-slate-400">
                <th className="px-5 py-3.5">Order #</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Items</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Payment Status</th>
                <th className="px-5 py-3.5">Gateway / Card</th>
                <th className="px-5 py-3.5">Val ID / Tran ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-semibold text-white">{order.orderNumber}</td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{order.customer.name}</div>
                    <div className="text-xs text-slate-400">{order.customer.email}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                  </td>
                  <td className="px-5 py-4 font-semibold text-white">
                    {order.currency} {order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
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
                  <td className="px-5 py-4 text-xs text-slate-300">
                    {order.cardType || order.paymentMethod}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-400">
                    <div>{order.tranId}</div>
                    {order.valId && <div className="text-emerald-400">VAL: {order.valId}</div>}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    No orders found.
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
