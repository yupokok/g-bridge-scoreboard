'use client'

import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  const handleNewGame = () => {
    const input = prompt('Enter player names, separated by commas:')
    if (!input) return

    const names = input
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0)

    if (names.length === 0) return

    const query = new URLSearchParams({ players: names.join(',') }).toString()
    router.push(`/game?${query}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8">German Bridge Calculator</h1>
      <div className="flex gap-6">
        <button
          onClick={handleNewGame}
          className="bg-indigo-600 text-white px-6 py-3 rounded shadow text-lg"
        >
          New Game
        </button>
        <button
          onClick={() => alert('All time stats coming soon!')}
          className="bg-gray-400 text-white px-6 py-3 rounded shadow text-lg"
        >
          All Time Stats
        </button>
      </div>
    </main>
  )
}
