import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

function navTo(page: string) {
  const u = new URL(window.location.href);
  u.searchParams.set('page', page);
  window.location.href = u.toString();
}

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMsg(null);
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    setBusy(false);
    if (error) { setError(error.message); return; }
    if (data?.user) setMsg('Check your email to verify your account, then sign in.');
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <button className="mb-4 text-sm underline" onClick={() => navTo('login')}>← Back to login</button>
      <h1 className="text-2xl font-semibold mb-6">Create Account</h1>
      <form onSubmit={onSignup} className="space-y-3">
        <input type="text" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
        <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
        <input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2" required />
        <button type="submit" className="w-full bg-emerald-500 text-white rounded-md px-4 py-3" disabled={busy}>{busy ? 'Creating…' : 'Sign Up'}</button>
      </form>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {msg && <p className="mt-3 text-sm text-emerald-600">{msg}</p>}
    </div>
  );
}
