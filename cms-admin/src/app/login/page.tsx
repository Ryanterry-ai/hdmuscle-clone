'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeOffIcon, LockClosedIcon, MailIcon, ShieldCheckIcon } from '@heroicons/react/outline';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid credentials');
        return;
      }

      const nextPath =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('next') || '/dashboard'
          : '/dashboard';

      router.replace(nextPath);
      router.refresh();
    } catch {
      setError('Unable to connect to the CMS. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.25),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.18),_transparent_30%),linear-gradient(135deg,_#0c0a09_10%,_#1c1917_45%,_#111827_100%)]" />
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-lg font-semibold text-stone-950">
                HD
              </div>
              <div>
                <p className="font-heading text-2xl font-semibold tracking-tight text-white">Universal CMS</p>
                <p className="text-sm text-stone-400">Commerce operations for hdmuscle.in</p>
              </div>
            </div>

            <div className="max-w-xl space-y-8">
              <div className="space-y-5">
                <p className="text-xs uppercase tracking-[0.28em] text-orange-300">Admin control surface</p>
                <h1 className="font-heading text-5xl font-semibold leading-[1.02] tracking-tight text-white xl:text-6xl">
                  Run products, content, collections, and live storefront publishing from one place.
                </h1>
                <p className="max-w-lg text-lg leading-8 text-stone-300">
                  This dashboard is now wired to your real CMS database and protected with a persistent admin session,
                  so the team sees live operational data instead of placeholder metrics.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Products</p>
                  <p className="mt-4 font-heading text-3xl font-semibold text-white">Live</p>
                  <p className="mt-2 text-sm text-stone-400">Managed from your CMS database and surfaced to the live site.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Sections</p>
                  <p className="mt-4 font-heading text-3xl font-semibold text-white">Editable</p>
                  <p className="mt-2 text-sm text-stone-400">Homepage content blocks and site settings in one panel.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Security</p>
                  <p className="mt-4 font-heading text-3xl font-semibold text-white">Guarded</p>
                  <p className="mt-2 text-sm text-stone-400">Session cookies and route protection for admin pages.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-stone-500">
              <p>HD Muscle India admin workspace</p>
              <p>Built for content, catalog, and commerce ops</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-4 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-stone-950">
                HD
              </div>
              <div>
                <p className="font-heading text-2xl font-semibold text-white">Universal CMS</p>
                <p className="text-sm text-stone-400">Admin login</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#14110f] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
              <div className="mb-8 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-orange-200">
                  <ShieldCheckIcon className="h-4 w-4" />
                  Secure sign in
                </div>
                <div>
                  <h2 className="font-heading text-3xl font-semibold tracking-tight text-white">Welcome back</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-400">
                    Sign in with your CMS admin account to manage hdmuscle.in storefront content and commerce data.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleLogin}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-300">Email address</span>
                  <span className="relative block">
                    <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@hdmuscle.in"
                      required
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-orange-400/50 focus:ring-4 focus:ring-orange-400/10"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-300">Password</span>
                  <span className="relative block">
                    <LockClosedIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-orange-400/50 focus:ring-4 focus:ring-orange-400/10"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 transition hover:text-white"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </span>
                </label>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <label className="flex cursor-pointer items-center gap-2 text-stone-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-400/30"
                    />
                    Keep me signed in
                  </label>
                  <Link href="/dashboard/settings" className="text-orange-300 transition hover:text-orange-200">
                    Need access?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-4 text-sm font-semibold text-stone-950 transition hover:from-amber-400 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing in…' : 'Enter dashboard'}
                </button>
              </form>

              <p className="mt-6 text-sm leading-6 text-stone-500">
                This admin workspace controls synced products, collections, content sections, store settings, and media
                for <span className="text-stone-300">hdmuscle.in</span>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
