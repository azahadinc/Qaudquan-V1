'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth/login');
  }, [router]);

  return (
    <main className="min-h-screen w-full bg-neutral-900 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold">Qaudquan</h1>
        <p className="text-xl text-neutral-400">Redirecting to login...</p>
      </div>
    </main>
  );
}
