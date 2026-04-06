'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const defaultUser = { username: 'admin', password: 'admin' };

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('qaudquanUser')) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const savedCredentials = typeof window !== 'undefined'
      ? localStorage.getItem('qaudquanCredentials')
      : null;

    const storedUser = savedCredentials ? JSON.parse(savedCredentials) : null;
    const isValidDefault = username === defaultUser.username && password === defaultUser.password;
    const isValidStored = storedUser && username === storedUser.username && password === storedUser.password;

    if (!isValidDefault && !isValidStored) {
      setError('Invalid username or password.');
      return;
    }

    localStorage.setItem('qaudquanUser', username);
    router.push('/dashboard');
  };

  return (
    <main
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/bg1.jpg')" }}
    >
      <div className="w-full max-w-md rounded-3xl bg-slate-950/90 border border-white/10 p-8 shadow-2xl backdrop-blur-lg text-white">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-semibold">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-300">Sign in with your admin account or create a new one.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-200">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="admin"
            />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-300">
          <p>
            Default login: <span className="font-medium text-white">admin</span> / <span className="font-medium text-white">admin</span>
          </p>
          <p className="mt-4">
            New here?{' '}
            <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
