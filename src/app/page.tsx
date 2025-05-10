'use client'

import { useState } from 'react'

type Player = {
  name: string
  score: number
}

type Action = {
  playerIndex: number
  delta: number
}

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([
    { name: 'Player 1', score: 0 },
    { name: 'Player 2', score: 0 },
  ])
  const [history, setHistory] = useState<Action[]>([])

  const handleScoreChange = (index: number, delta: number) => {
    const updated = [...players]
    updated[index].score += delta
    setPlayers(updated)
    setHistory([...history, { playerIndex: index, delta }])
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

  const resetScores = () => {
    if (confirm('Are you sure you want to reset all scores?')) {
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

  const newGame = () => {
    if (confirm('Start a new game? This will remove all players.')) {
      setPlayers([])
      setHistory([])
    }
  }

  return (
    <main className="main">
      <h1 className="text-3xl font-bold mb-6">Wee FamBam's German Bridge Scoreboard</h1>

      <table className="min-w-full border border-gray-300 bg-white shadow rounded-lg overflow-hidden">
        <thead className="thead">
          <tr>
            <th className="p-3 text-left">Player</th>
            <th className="p-3 text-left">Score</th>
            <th className="p-3 text-left">+10</th>
            <th className="p-3 text-left">-1</th>
            <th className="p-3 text-left">+1</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={index} className="border-t border-gray-300">
              <td className="p-3">{player.name}</td>
              <td className="p-3">{player.score}</td>
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
                  className="button"
                  onClick={() => handleScoreChange(index, -1)}
                >
                  -1
                </button>
              </td>
              <td className="p-3">
                <button
                  className="button"
                  onClick={() => handleScoreChange(index, 1)}
                >
                  +1
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex gap-4">
        <button
          onClick={addPlayer}
          className="button"
        >
          Add Player
        </button>
        <button
          onClick={undo}
          className="button"
        >
          Undo
        </button>

        <button
          onClick={newGame}
          className="bg-red-600 text-white px-4 py-2 rounded shadow"
        >
          New Game
        </button>

      </div>
    </main>
  )
}
