import React, { useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabase(): SupabaseClient {
  const w = window as any;
  if (w.supabase) return w.supabase as SupabaseClient;
  const url = (import.meta as any).env.VITE_SUPABASE_URL;
  const anon = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
  return createClient(url, anon);
}

export function LoginPage() {
  const supabase = getSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // If already signed in, show a notice
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setMsg('You are already signed in.');
      }
    });
  }, [supabase]);

  const signInWithGoogle = async () => {
    setMsg(null);
    setBusy(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/?page=home',
          queryParams: { prompt: 'select_account' } // ensure the Google chooser appears
        }
      });
      // Redirect will occur; if not, fall back:
      setTimeout(() => (window.location.href = '/?page=home'), 4000);
    } catch (e: any) {
      setMsg(e?.message || 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = '/?page=home';
    } catch (e: any) {
      setMsg(e?.message || 'Email sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <button onClick={() => (window.location.href='/?page=home')} className="text-sm">&larr; Back</button>
      <h1 className="text-2xl font-semibold mt-2 mb-4">Welcome Back</h1>

      <button
        onClick={signInWithGoogle}
        disabled={busy}
        className="w-full rounded bg-emerald-600 py-2 px-3 text-white"
      >
        Continue with Google
      </button>

      <div className="my-4 text-center text-gray-500 text-sm">OR CONTINUE WITH EMAIL</div>

      <form onSubmit={signInWithEmail} className="space-y-3">
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
          placeholder="Your password"
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
          Sign In
        </button>
      </form>

      {msg && <p className="mt-3 text-sm text-rose-600">{msg}</p>}

      <div className="mt-6 text-center text-sm">
        Don’t have an account?{' '}
        <a className="text-emerald-700 underline" href="/?page=signup">Create one</a>
      </div>
    </div>
  );
}
