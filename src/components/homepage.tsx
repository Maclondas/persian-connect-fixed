import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function HomePage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAds() {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading ads:', error);
      } else {
        setAds(data ?? []);
      }
      setLoading(false);
    }

    loadAds();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome to Persian Connect</h1>
      <p className="text-gray-600 mb-6">Explore classifieds in your community.</p>

      {loading && <p>Loading ads...</p>}
      {!loading && ads.length === 0 && <p>No ads found.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad) => (
          <div key={ad.id} className="border rounded-lg p-4 shadow">
            <h2 className="font-semibold text-lg mb-1">{ad.title}</h2>
            <p className="text-gray-600 text-sm mb-2">{ad.description}</p>
            <p className="text-sm font-medium">
              {ad.price} {ad.currency} – {ad.location}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
