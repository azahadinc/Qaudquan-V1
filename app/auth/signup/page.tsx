'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError('Please complete all fields.');
      setSuccess('');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords must match.');
      setSuccess('');
      return;
    }

    const credentials = { username, password, email };
    localStorage.setItem('qaudquanCredentials', JSON.stringify(credentials));
    localStorage.setItem('qaudquanUser', username);
    setSuccess('Your account has been created. Redirecting...');
    setError('');
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  return (
    <main
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/bg1.jpg')" }}
    >
      <div className="w-full max-w-lg rounded-3xl bg-slate-950/90 border border-white/10 p-8 shadow-2xl backdrop-blur-lg text-white">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-semibold">Create Account</h1>
          <p className="mt-2 text-sm text-slate-300">Register a new profile for Qaudquan.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-200">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Choose a username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Enter a password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Repeat your password"
            />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          {success && <p className="text-sm text-emerald-400">{success}</p>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-300">
          <p>
            Already registered?{' '}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
