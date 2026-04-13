'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Suspense } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[400px]">
      <div className="mb-6">
        <label className="block font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-[7px]">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full bg-bg-3 border border-border px-[14px] py-3 text-text font-body text-[13px] outline-none focus:border-gold-lo transition-colors placeholder:text-text-3"
          placeholder="admin@mbautocollective.com"
        />
      </div>

      <div className="mb-6">
        <label className="block font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-[7px]">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full bg-bg-3 border border-border px-[14px] py-3 text-text font-body text-[13px] outline-none focus:border-gold-lo transition-colors placeholder:text-text-3"
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-[12px] text-red-400 mb-5">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gold text-bg font-body text-[11px] tracking-[0.22em] uppercase px-9 py-[14px] font-[500] hover:bg-gold-hi transition-colors disabled:opacity-60"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="mb-10 text-center">
        <div className="font-display text-[28px] font-[400] mb-1">
          MB <span className="text-gold">Auto</span> Collective
        </div>
        <div className="font-mono-custom text-[9px] tracking-[0.3em] uppercase text-text-3">
          Admin Dashboard
        </div>
      </div>

      <div className="w-full max-w-[400px] bg-bg-2 border border-border p-10">
        <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-gold mb-2">
          Sign In
        </div>
        <h1 className="font-display text-[28px] font-[300] mb-8">
          Welcome <em className="italic text-gold-hi">back</em>
        </h1>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
