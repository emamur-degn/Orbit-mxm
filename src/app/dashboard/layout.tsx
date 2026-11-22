import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/dashboard/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      role: true,
      workspace: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-[#09090f] text-slate-100">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <header className="flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#0b0c13]/80 px-6 backdrop-blur">
          <div className="text-xs text-slate-400">
            Backend API + SSLCommerz Payment Gateway Connected
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              ● Gateway Ready
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#13141f] px-3 py-1.5 text-xs font-medium text-white">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold">
                {user.name.slice(0, 2).toUpperCase()}
              </span>
              {user.name.split(' ')[0]}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
