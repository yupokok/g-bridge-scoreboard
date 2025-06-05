'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type Player = {
  name: string
  score: number
}

type Action = {
  playerIndex: number
  delta: number
}

export default function GamePage() {
  const searchParams = useSearchParams()
  const [players, setPlayers] = useState<Player[]>([])
  const [history, setHistory] = useState<Action[]>([])

  useEffect(() => {
    const playerString = searchParams.get('players')
    if (playerString) {
      const names = playerString
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0)

      const initialPlayers = names.map(name => ({ name, score: 0 }))
      setPlayers(initialPlayers)
    }
  }, [searchParams])

  const scorePlayer = (index: number) => {
    const bidStr = prompt(`Enter bid by ${players[index].name}:`)
    const actualStr = prompt(`Enter sets won by ${players[index].name}:`)
    if (!bidStr || !actualStr) return

    const bid = parseInt(bidStr)
    const actual = parseInt(actualStr)

    if (isNaN(bid) || isNaN(actual)) {
      alert('Please enter valid numbers')
      return
    }

    let delta: number
    if (bid === actual) {
      delta = 10 + Math.pow(bid, 2)
    } else {
      delta = -Math.pow(bid - actual, 2)
    }

    handleScoreChange(index, delta)
  }


  const handleScoreChange = (index: number, delta: number) => {
    const updated = [...players]
    updated[index].score += delta
    setPlayers(updated)
    setHistory([...history, { playerIndex: index, delta }])
  }

  const resetScores = () => {
    if (confirm('Reset all scores?')) {
      const reset = players.map(p => ({ ...p, score: 0 }))
      setPlayers(reset)
      setHistory([])
    }
  }

  const undo = () => {
    const last = history.pop()
    if (!last) return
    const updated = [...players]
    updated[last.playerIndex].score -= last.delta
    setPlayers(updated)
    setHistory([...history])
  }

  const addPlayer = () => {
    const input = prompt('Enter player names, separated by commas:')
    if (!input) return

    const names = input
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0)

    const newPlayers = names.map(name => ({ name, score: 0 }))
    setPlayers([...players, ...newPlayers])
  }

  const newGame = () => {
    if (confirm('Start a new game? This will remove all players.')) {
      setPlayers([])
      setHistory([])
    }
  }

  const maxScore = Math.max(...players.map(p => p.score), 0)

  if (players.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center text-center">
        <p className="text-xl text-gray-500">No players yet. Return to home to start a new game.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">German Bridge Game</h1>

      <table className="min-w-full border border-gray-300 bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Player</th>
            <th className="p-3 text-left">Score</th>
            <th className="p-3 text-left">Input Bids</th>
            <th className="p-3 text-left">+10</th>
            <th className="p-3 text-left">+1</th>
            <th className="p-3 text-left">-1</th>
            <th className="p-3 text-left">Custom</th>
          </tr>
        </thead>
        <tbody>
          {[...players]
            .sort((a, b) => b.score - a.score)
            .map((player, index) => (
              <tr
                key={index}
                className={`border-t border-gray-300 ${player.score === maxScore && maxScore > 0 ? 'bg-yellow-100' : ''
                  }`}
              >
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{player.name}</td>
                <td className="p-3">{player.score}</td>
                <td className="p-3">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => scorePlayer(index)}
                  >
                    Input Bids
                  </button>
                </td>

                <td className="p-3">
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded"
                    onClick={() => handleScoreChange(index, 10)}
                  >
                    +10
                  </button>
                </td>
                <td className="p-3">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => handleScoreChange(index, 1)}
                  >
                    +1
                  </button>
                </td>
                <td className="p-3">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => handleScoreChange(index, -1)}
                  >
                    -1
                  </button>
                </td>
                <td className="p-3">
                  <button
                    className="bg-gray-600 text-white px-3 py-1 rounded"
                    onClick={() => {
                      const val = prompt('Enter custom value:')
                      const delta = parseInt(val || '')
                      if (!isNaN(delta)) handleScoreChange(index, delta)
                    }}
                  >
                    Custom
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <div className="mt-6 flex gap-4 flex-wrap">
        <button
          onClick={addPlayer}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow"
        >
          Add Player
        </button>
        <button
          onClick={undo}
          className="bg-yellow-500 text-white px-4 py-2 rounded shadow"
        >
          Undo
        </button>
        <button
          onClick={resetScores}
          className="bg-red-600 text-white px-4 py-2 rounded shadow"
        >
          Reset
        </button>
        <button
          onClick={newGame}
          className="bg-black text-white px-4 py-2 rounded shadow"
        >
          New Game
        </button>
      </div>
    </main>
  )
}
