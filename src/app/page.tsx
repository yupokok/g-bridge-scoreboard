'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">German Bridge Calculator</h1>
      <button
        className="bg-blue-600 text-white px-6 py-3 rounded mb-4"
        onClick={() => router.push('/game')}
      >
        New Game
      </button>
      <button className="bg-gray-600 text-white px-6 py-3 rounded opacity-50 cursor-not-allowed">
        All Time Stats (Coming Soon)
      </button>
    </main>
  );
}
