import React from 'react';

export function HomePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome to Persian Connect</h1>
      <p className="text-gray-600">Browse ads from your community</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Category name="Vehicles" />
        <Category name="Real Estate" />
        <Category name="Jobs" />
        <Category name="Digital Goods" />
      </div>
    </div>
  );
}

function Category({ name }: { name: string }) {
  return (
    <div className="p-4 border rounded shadow hover:shadow-md transition">
      <p className="text-center font-medium">{name}</p>
    </div>
  );
}
