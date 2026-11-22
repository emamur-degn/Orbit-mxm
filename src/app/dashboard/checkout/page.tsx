'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, ShieldCheck, ExternalLink } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingInterval: string;
}

function CheckoutFormContent() {
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get('productId') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState(preselectedProductId);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('Ariful Islam');
  const [customerEmail, setCustomerEmail] = useState('arif@example.com');
  const [customerPhone, setCustomerPhone] = useState('01711223344');
  const [customerCity, setCustomerCity] = useState('Chattogram');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        const list = data.products || [];
        setProducts(list);
        if (!productId && list.length > 0) {
          setProductId(list[0].id);
        }
      });
  }, [productId]);

  const selectedProduct = products.find((p) => p.id === productId);
  const totalAmount = selectedProduct ? selectedProduct.price * quantity : 0;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity,
          customerName,
          customerEmail,
          customerPhone,
          customerCity,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.gatewayUrl) {
        setError(data.error || 'Could not initiate SSLCommerz payment session.');
        setLoading(false);
        return;
      }

      // Redirect user to SSLCommerz Hosted Payment Gateway
      window.location.href = data.gatewayUrl;
    } catch {
      setError('Failed to connect to payment initialization endpoint.');
      setLoading(false);
    }
  }

  return (
    <div className="grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-5">
      <form
        onSubmit={handleCheckout}
        className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#12131d] p-6 lg:col-span-3"
      >
        <h2 className="text-lg font-semibold text-white">Customer & Plan Selection</h2>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase text-slate-400">
            Select SaaS Product
          </label>
          <select
            required
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.currency} {p.price.toLocaleString()} ({p.billingInterval})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase text-slate-400">
              Customer Name
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase text-slate-400">
              Customer Email
            </label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase text-slate-400">
              Phone
            </label>
            <input
              type="text"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase text-slate-400">
              City
            </label>
            <input
              type="text"
              value={customerCity}
              onChange={(e) => setCustomerCity(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase text-slate-400">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !productId}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 disabled:opacity-50"
        >
          <CreditCard size={17} />
          {loading ? 'Connecting to SSLCommerz...' : 'Pay Now via SSLCommerz'}
          <ExternalLink size={15} />
        </button>
      </form>

      <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#12131d] p-6 lg:col-span-2">
        <div>
          <h3 className="text-base font-semibold text-white">Order Summary</h3>
          <div className="mt-4 space-y-3 border-b border-white/[0.07] pb-4 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Plan</span>
              <span className="font-medium text-white">{selectedProduct?.name || '—'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Quantity</span>
              <span>{quantity}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Gateway</span>
              <span className="text-violet-400">SSLCommerz v4</span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-sm text-slate-400">Total Payable</span>
            <span className="text-2xl font-bold text-white">
              {selectedProduct?.currency || 'BDT'} {totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-slate-300">
          <div className="mb-1 flex items-center gap-1.5 font-semibold text-emerald-400">
            <ShieldCheck size={15} /> Server-Side Validation Flow
          </div>
          Supports bKash, Nagad, Rocket, Visa, Mastercard, and Internet Banking with automatic IPN &
          Validation API verification.
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">SSLCommerz Payment Checkout</h1>
        <p className="text-sm text-slate-400">
          Creates a database order and redirects to the SSLCommerz hosted payment gateway.
        </p>
      </div>
      <Suspense fallback={<div className="text-sm text-slate-400">Loading checkout...</div>}>
        <CheckoutFormContent />
      </Suspense>
    </div>
  );
}
