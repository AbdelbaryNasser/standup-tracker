'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/actions/auth';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
      <h1 className="text-xl font-semibold text-white mb-1">Sign in</h1>
      <p className="text-sm text-zinc-500 mb-6">Welcome back to your team standup</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-950/50 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-zinc-400">
            Email
          </label>
          <Input id="email" name="email" type="email" placeholder="you@company.com" required autoFocus />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-zinc-400">
            Password
          </label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>

        <Button type="submit" loading={isPending} className="w-full" size="lg">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        No account?{' '}
        <Link href="/register" className="font-medium text-blue-400 hover:text-blue-300">
          Create one
        </Link>
      </p>
    </div>
  );
}
