import React, { useState } from 'react';
import supabase from '../utils/supabase/client';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      window.location.href = '/';
    }
  };

  const signInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
    } catch (err: any) {
      setError(err?.message ?? 'OAuth sign-in failed');
    }
  };

  return (
    <div style={{maxWidth: 480, margin: '40px auto', padding: 24}}>
      <h1 style={{fontSize: 24, marginBottom: 16}}>Welcome Back</h1>

      <button
        onClick={signInWithGoogle}
        style={{width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', marginBottom: 16}}
      >
        Continue with Google
      </button>

      <div style={{textAlign: 'center', color: '#999', margin: '12px 0'}}>OR CONTINUE WITH EMAIL</div>

      <form onSubmit={signIn}>
        <label style={{display: 'block', marginBottom: 6}}>Email Address</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', marginBottom: 12}}
        />

        <label style={{display: 'block', marginBottom: 6}}>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          style={{width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', marginBottom: 16}}
        />

        {error && <div style={{color: 'crimson', marginBottom: 12}}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{width: '100%', padding: '12px 14px', borderRadius: 8, border: 'none', background: '#10b981', color: 'white', fontWeight: 600}}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
export { LoginPage };
