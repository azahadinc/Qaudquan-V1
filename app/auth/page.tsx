'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <p className="text-lg">Redirecting to login...</p>
      </div>
    </main>
  );
}
