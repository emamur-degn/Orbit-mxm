import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Orbit — SaaS Admin & SSLCommerz Commerce Engine',
  description: 'Next.js + Prisma + SSLCommerz SaaS Backend & Admin Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090f] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
