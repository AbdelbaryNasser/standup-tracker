'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { register } from '@/lib/actions/auth';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await register(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
      <h1 className="text-xl font-semibold text-white mb-1">Create account</h1>
      <p className="text-sm text-zinc-500 mb-6">Join your team on Standup Tracker</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-950/50 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="full_name" className="block text-sm font-medium text-zinc-400">
            Full name
          </label>
          <Input id="full_name" name="full_name" type="text" placeholder="Jane Smith" required autoFocus />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-zinc-400">
            Email
          </label>
          <Input id="email" name="email" type="email" placeholder="jane@company.com" required />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-zinc-400">
            Password
          </label>
          <Input id="password" name="password" type="password" placeholder="Min 6 characters" required minLength={6} />
        </div>

        <Button type="submit" loading={isPending} className="w-full" size="lg">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}
