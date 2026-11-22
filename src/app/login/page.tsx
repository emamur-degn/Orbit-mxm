import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090f] px-4 py-12">
      <Suspense fallback={<div className="text-sm text-slate-400">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
