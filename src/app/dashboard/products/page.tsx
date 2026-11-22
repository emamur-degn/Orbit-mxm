import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">SaaS Products & Plans</h1>
          <p className="text-sm text-slate-400">
            Manage your SaaS offerings, pricing tiers, and inventory.
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#12131d] p-6"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-violet-500/15 px-2.5 py-1 font-mono text-xs text-violet-300">
                  {product.sku}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    product.status === 'ACTIVE'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-slate-500/20 text-slate-300'
                  }`}
                >
                  {product.status}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-bold text-white">{product.name}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {product.description || 'SaaS subscription package'}
              </p>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white">
                  {product.currency} {product.price.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">/ {product.billingInterval.toLowerCase()}</span>
              </div>

              {product.features.length > 0 && (
                <ul className="mt-4 space-y-1.5 border-t border-white/[0.06] pt-4 text-xs text-slate-300">
                  {product.features.map((f, i) => (
                    <li key={i}>✓ {f}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs text-slate-400">
              <span>Stock: {product.stock}</span>
              <Link
                href={`/dashboard/checkout?productId=${product.id}`}
                className="font-semibold text-violet-400 hover:text-violet-300"
              >
                Checkout with SSLCommerz →
              </Link>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#12131d] py-16 text-center">
            <Package className="mb-3 text-slate-500" size={32} />
            <p className="text-base font-medium text-white">No products added yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Create your first SaaS product to start accepting orders.
            </p>
            <Link
              href="/dashboard/products/new"
              className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
            >
              + Add Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
