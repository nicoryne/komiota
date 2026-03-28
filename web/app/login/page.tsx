'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@/lib/schemas/login';
import { loginAction } from '@/actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setFormError('');

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      if (fieldErrors.email?.length) setEmailError(fieldErrors.email[0]);
      if (fieldErrors.password?.length) setPasswordError(fieldErrors.password[0]);
      return;
    }

    setLoading(true);
    try {
      const result = await loginAction(email, password);
      if (result.success) {
        router.push('/dashboard');
      } else {
        const errorMsg = result.error ?? 'Login failed';
        const isNoAccess =
          result.userRole === 'user' ||
          errorMsg.toLowerCase().includes('access');
        setFormError(
          isNoAccess
            ? 'You do not have access to the dashboard.'
            : errorMsg
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-vanilla-milk px-4">
      <div className="w-full max-w-sm flex flex-col gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl">🦫</div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-deep-amethyst tracking-tight">Komiota</h1>
            <p className="text-sm text-plum-builder font-medium">Dashboard Login</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-deep-amethyst">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-[12px] border border-orchid-petal bg-white text-deep-amethyst text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-plum-builder focus:border-plum-builder transition"
            />
            {emailError && (
              <p className="text-xs text-red-500">{emailError}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-deep-amethyst">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-[12px] border border-orchid-petal bg-white text-deep-amethyst text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-plum-builder focus:border-plum-builder transition"
            />
            {passwordError && (
              <p className="text-xs text-red-500">{passwordError}</p>
            )}
          </div>

          {formError && (
            <p className="text-sm text-red-500 text-center">{formError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-deep-amethyst text-vanilla-milk text-sm font-semibold hover:bg-plum-builder transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
