'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Users } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  city: string;
  country: string;
  totalSpent: number;
  ordersCount: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('Chattogram');
  const [saving, setSaving] = useState(false);

  async function loadCustomers() {
    setLoading(true);
    const res = await fetch('/api/customers');
    const data = await res.json();
    setCustomers(data.customers || []);
    setLoading(false);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, company, city, country: 'Bangladesh' }),
    });
    if (res.ok) {
      setName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setShowForm(false);
      await loadCustomers();
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers Directory</h1>
          <p className="text-sm text-slate-400">
            Manage SaaS buyers, lifetime spend, and contact information.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          <UserPlus size={16} />
          {showForm ? 'Close Form' : 'Add Customer'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddCustomer}
          className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-[#12131d] p-6 md:grid-cols-3"
        >
          <input
            type="text"
            required
            placeholder="Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white"
          />
          <input
            type="email"
            required
            placeholder="Email Address *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white"
          />
          <input
            type="text"
            required
            placeholder="Phone (+8801...) *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white"
          />
          <input
            type="text"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white"
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0b0c12] px-3.5 py-2.5 text-sm text-white"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
          >
            {saving ? 'Saving...' : 'Save Customer'}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12131d]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] bg-[#0e0f17] text-xs uppercase text-slate-400">
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Phone</th>
                <th className="px-5 py-3.5">Company</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Orders</th>
                <th className="px-5 py-3.5">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.email}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-300">{c.phone}</td>
                  <td className="px-5 py-4 text-slate-300">{c.company || '—'}</td>
                  <td className="px-5 py-4 text-slate-400">
                    {c.city}, {c.country}
                  </td>
                  <td className="px-5 py-4 text-white">{c.ordersCount}</td>
                  <td className="px-5 py-4 font-semibold text-emerald-400">
                    ৳{c.totalSpent.toLocaleString()}
                  </td>
                </tr>
              ))}
              {!loading && customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    <Users className="mx-auto mb-2 text-slate-500" size={24} />
                    No customers found.
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
