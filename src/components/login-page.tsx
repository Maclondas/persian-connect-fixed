import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

function navTo(page: string) {
  const u = new URL(window.location.href);
  u.searchParams.set('page', page);
  window.location.href = u.toString();
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setError(error.message); return; }
    if (data?.user) navTo('home');
  }

  async function onGoogle() {
    setBusy(true);
    setError(null);
    const redirectTo = `${location.origin}/?page=auth-callback`;
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (error) { setBusy(false); setError(error.message); }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <button className="mb-4 text-sm underline" onClick={() => navTo('home')}>← Back</button>
      <h1 className="text-2xl font-semibold mb-6">Welcome Back</h1>
      <button className="w-full rounded-md border px-4 py-3 mb-4" onClick={onGoogle} disabled={busy}>Continue with Google</button>
      <div className="text-center text-xs uppercase text-gray-500 my-3">or continue with email</div>
      <form onSubmit={onEmailLogin} className="space-y-3">
        <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
        <input type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
        <button type="submit" className="w-full bg-emerald-500 text-white rounded-md px-4 py-3" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
      </form>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-6 text-center text-sm">
        New here? <button className="underline" onClick={() => navTo('signup')}>Create an account</button>
      </div>
    </div>
  );
}
