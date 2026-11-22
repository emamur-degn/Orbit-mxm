'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackagePlus, CheckCircle2 } from 'lucide-react';

export function AddProductForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('SaaS Subscription');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('BDT');
  const [billingInterval, setBillingInterval] = useState<'ONE_TIME' | 'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [stock, setStock] = useState('999');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT'>('ACTIVE');
  const [description, setDescription] = useState('');
  const [featuresText, setFeaturesText] = useState('REST API Access, Priority Support, SSLCommerz Billing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const features = featuresText
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          sku: sku || undefined,
          category,
          price: Number(price),
          currency,
          billingInterval,
          stock: Number(stock),
          status,
          description,
          features,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add product');
        setLoading(false);
        return;
      }

      router.push('/dashboard/products');
      router.refresh();
    } catch {
      setError('Network error while saving product.');
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl space-y-6 rounded-2xl border border-white/[0.08] bg-[#12131d] p-6 md:p-8"
    >
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
            Product / Plan Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Orbit Scale Pro"
            className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
            SKU (Auto-generated if blank)
          </label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="ORB-SCL-101"
            className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
            Price *
          </label>
          <input
            type="number"
            step="0.01"
            min="1"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="4900"
            className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="BDT">BDT (৳)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Billing Cycle
            </label>
            <select
              value={billingInterval}
              onChange={(e) => setBillingInterval(e.target.value as 'ONE_TIME' | 'MONTHLY' | 'YEARLY')}
              className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
              <option value="ONE_TIME">One-Time</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              License Stock
            </label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'DRAFT')}
              className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what customers receive with this SaaS product..."
          className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
          Included Features (comma-separated)
        </label>
        <input
          type="text"
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-white/[0.07] pt-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? <PackagePlus size={16} /> : <CheckCircle2 size={16} />}
          {loading ? 'Saving Product...' : 'Publish Product'}
        </button>
      </div>
    </form>
  );
}
