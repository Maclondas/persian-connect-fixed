import React, { useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabase(): SupabaseClient {
  const w = window as any;
  if (w.supabase) return w.supabase as SupabaseClient;
  const url = (import.meta as any).env.VITE_SUPABASE_URL;
  const anon = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
  return createClient(url, anon);
}

export function SignupPage() {
  const supabase = getSupabase();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });
      if (error) throw error;

      // If confirm emails are enabled, user must verify; otherwise we’re in.
      setMsg('Check your email to confirm your account. Once confirmed, you can sign in.');
    } catch (e: any) {
      setMsg(e?.message || 'Sign up failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <button onClick={() => (window.location.href='/?page=home')} className="text-sm">&larr; Back</button>
      <h1 className="text-2xl font-semibold mt-2 mb-4">Create Account</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-emerald-600 py-2 px-3 text-white"
        >
          Sign Up
        </button>
      </form>

      {msg && <p className="mt-3 text-sm text-emerald-700">{msg}</p>}

      <div className="mt-6 text-center text-sm">
        Already have an account?{' '}
        <a className="text-emerald-700 underline" href="/?page=login">Sign in</a>
      </div>
    </div>
  );
}
