import { Shield, Server, Webhook, Database } from 'lucide-react';

export default function SettingsPage() {
  const endpoints = [
    { method: 'POST', path: '/api/auth/register', desc: 'Register new SaaS admin & issue JWT cookie' },
    { method: 'POST', path: '/api/auth/login', desc: 'Authenticate credentials & set session cookie' },
    { method: 'GET / POST', path: '/api/products', desc: 'List or create SaaS products in Prisma DB' },
    { method: 'GET / POST', path: '/api/customers', desc: 'Manage customer records & spend metrics' },
    { method: 'GET / POST', path: '/api/orders', desc: 'Create and query SaaS customer orders' },
    { method: 'POST', path: '/api/payment/init', desc: 'Initialize SSLCommerz v4 session & GatewayPageURL' },
    { method: 'POST', path: '/api/payment/success', desc: 'Validate val_id via SSLCommerz Validation API & mark PAID' },
    { method: 'POST', path: '/api/payment/ipn', desc: 'Asynchronous Instant Payment Notification (IPN) listener' },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Backend Architecture & API Reference</h1>
        <p className="text-sm text-slate-400">
          Production endpoints, database models, and SSLCommerz gateway configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-[#12131d] p-5">
          <Shield className="mb-2 text-violet-400" size={20} />
          <div className="text-sm font-semibold text-white">JWT + Middleware</div>
          <p className="mt-1 text-xs text-slate-400">
            Edge middleware protects <code>/dashboard/*</code> via signed HTTP-only cookies.
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[#12131d] p-5">
          <Database className="mb-2 text-violet-400" size={20} />
          <div className="text-sm font-semibold text-white">Prisma + PostgreSQL</div>
          <p className="mt-1 text-xs text-slate-400">
            Relational models for User, Product, Customer, Order, OrderItem & PaymentLog.
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[#12131d] p-5">
          <Webhook className="mb-2 text-violet-400" size={20} />
          <div className="text-sm font-semibold text-white">SSLCommerz v4</div>
          <p className="mt-1 text-xs text-slate-400">
            Configure <code>SSLCZ_STORE_ID</code> & <code>SSLCZ_STORE_PASSWORD</code> in <code>.env</code>.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#12131d] p-6">
        <div className="mb-4 flex items-center gap-2">
          <Server size={18} className="text-violet-400" />
          <h2 className="text-base font-semibold text-white">REST API Endpoints</h2>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {endpoints.map((ep) => (
            <div key={ep.path} className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="rounded bg-violet-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-violet-300">
                  {ep.method}
                </span>
                <code className="text-xs text-white">{ep.path}</code>
              </div>
              <span className="text-xs text-slate-400">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
