import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Ad = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: string;
  category: string;
  location: string;
  images: string[] | null;
  status: string;
};

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

function AdCard({ ad }: { ad: Ad }) {
  return (
    <div className="rounded-lg border shadow-sm p-4 hover:shadow-md transition">
      <h2 className="font-semibold text-lg mb-1">{ad.title}</h2>
      <p className="text-gray-600 text-sm mb-2">{ad.description}</p>
      <div className="text-sm">
        <span className="font-medium">{ad.price} {ad.currency}</span>
        <span className="text-gray-500"> — {ad.location}</span>
      </div>
    </div>
  );
}

export function HomePage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (!mounted) return;
      if (!error && data) setAds(data as Ad[]);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold">Persian Connect</a>
          <nav className="flex items-center gap-4">
            <a className="text-sm hover:underline" href="/?page=login">Login</a>
            <a className="text-sm hover:underline" href="/?page=signup">Create account</a>
            <a className="inline-block bg-emerald-600 text-white px-3 py-1.5 rounded-md text-sm" href="/?page=post">Post Ad</a>
          </nav>
        </div>
      </header>

      <section className="bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-2">Welcome to Persian Connect</h1>
          <p className="text-gray-600">Explore classifieds in your community.</p>
          <div className="mt-4 flex gap-3">
            <a href="/?page=signup" className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm">Get started</a>
            <a href="/?page=login" className="border px-4 py-2 rounded-md text-sm">Sign in</a>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="font-semibold text-lg mb-3">Browse categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a href="/#vehicles" className="border rounded-lg p-4 text-center hover:border-emerald-500">Vehicles</a>
          <a href="/#real-estate" className="border rounded-lg p-4 text-center hover:border-emerald-500">Real Estate</a>
          <a href="/#jobs" className="border rounded-lg p-4 text-center hover:border-emerald-500">Jobs</a>
          <a href="/#digital-goods" className="border rounded-lg p-4 text-center hover:border-emerald-500">Digital Goods</a>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="font-semibold text-lg mb-3">Latest ads</h2>
        {loading && <p className="text-gray-500">Loading ads…</p>}
        {!loading && ads.length === 0 && <p className="text-gray-500">No ads found.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-500">
          © {new Date().getFullYear()} Persian Connect
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
