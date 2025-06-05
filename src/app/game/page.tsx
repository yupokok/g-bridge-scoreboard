'use client';

import React, { useState } from 'react';

type Player = {
  name: string;
  score: number;
};

export default function GamePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [undoStack, setUndoStack] = useState<Player[][]>([]);
  const [showAddPlayers, setShowAddPlayers] = useState(true);
  const [inputNames, setInputNames] = useState('');

  // Add players from comma separated input
  const addPlayers = () => {
    const newPlayers = inputNames
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
      .map((name) => ({ name, score: 0 }));

    if (newPlayers.length > 0) {
      setPlayers(newPlayers);
      setUndoStack([]);
      setShowAddPlayers(false);
      setInputNames('');
    }
  };

  // Undo last change
  const undo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setPlayers(last);
    setUndoStack((stack) => stack.slice(0, stack.length - 1));
  };

  // Reset scores to zero
  const reset = () => {
    setUndoStack((stack) => [...stack, players]);
    setPlayers(players.map((p) => ({ ...p, score: 0 })));
  };

  // New Game - clear everything, back to add players
  const newGame = () => {
    setPlayers([]);
    setUndoStack([]);
    setShowAddPlayers(true);
  };

  // Score round based on German Bridge rules
  const scorePlayer = (index: number) => {
    const bidStr = prompt(`${players[index].name} - Enter bid (number of sets)`);
    const wonStr = prompt(`${players[index].name} - Enter sets won`);

    if (!bidStr || !wonStr) return;

    const bid = parseInt(bidStr, 10);
    const won = parseInt(wonStr, 10);

    if (isNaN(bid) || isNaN(won)) {
      alert('Invalid numbers entered.');
      return;
    }

    const prevPlayers = JSON.parse(JSON.stringify(players)); // deep copy for undo

    let scoreChange = 0;
    if (bid === won) {
      scoreChange = 10 + Math.pow(won, 2);
    } else {
      scoreChange = -Math.pow(Math.abs(bid - won), 2);
    }

    const newPlayers = [...players];
    newPlayers[index] = {
      ...newPlayers[index],
      score: newPlayers[index].score + scoreChange,
    };

    setUndoStack((stack) => [...stack, prevPlayers]);
    setPlayers(newPlayers);
  };

  // Quick add/subtract score helper
  const quickAdjustScore = (index: number, amount: number) => {
    const prevPlayers = JSON.parse(JSON.stringify(players));
    const newPlayers = [...players];
    newPlayers[index] = {
      ...newPlayers[index],
      score: newPlayers[index].score + amount,
    };
    setUndoStack((stack) => [...stack, prevPlayers]);
    setPlayers(newPlayers);
  };

  // Highlight leader row
  const maxScore = players.length ? Math.max(...players.map((p) => p.score)) : 0;

  // Sort players descending by score
  const sortedPlayers = players
    .map((p, i) => ({ ...p, originalIndex: i }))
    .sort((a, b) => b.score - a.score);

  return (
    <main>
      <h1 className="text-2xl font-bold">Wee FamBam's Spectacular Addiction</h1>
      <h2  className="text-xl mb-6"> German Bridge Scoreboard </h2>
      <br />

      {showAddPlayers && (
        <section className="mb-6">
          <h2 className="mb-2">Add players (comma separated):</h2>
          <input
            type="text"
            className="border px-3 py-2 rounded"
            value={inputNames}
            onChange={(e) => setInputNames(e.target.value)}
            placeholder="Player1, Player2, Player3"
            onKeyDown={(e) => e.key === 'Enter' && addPlayers()}
          />
          <br />
          <button
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
            onClick={addPlayers}
          >
            Start Game
          </button>
        </section>
      )}

      {!showAddPlayers && (
        <>
          <div className="mb-4 space-x-2">
            <button
              className="bg-red-600 text-white px-4 py-2 rounded"
              onClick={newGame}
            >
              New Game
            </button>
            <button
              className="bg-yellow-600 text-white px-4 py-2 rounded"
              onClick={undo}
              disabled={undoStack.length === 0}
              title={undoStack.length === 0 ? 'Nothing to undo' : ''}
            >
              Undo
            </button>
            <button
              className="bg-gray-600 text-white px-4 py-2 rounded"
              onClick={reset}
            >
              Reset Scores
            </button>
          </div>

          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border border-gray-400 px-3 py-1 w-5">Rank</th>
                <th className="border border-gray-400 px-3 py-1 w-40">Player</th>
                <th className="border border-gray-400 px-3 py-1 w-20">Score</th>
                <th className="border border-gray-400 px-3 py-1 w-40">Calculate</th>
                <th className="border border-gray-400 px-3 py-1 w-40">Quick Add/Subtract</th>

              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, rank) => (
                <tr
                  key={player.originalIndex}
                  className={
                    player.score === maxScore && maxScore !== 0
                      ? 'bg-yellow-200 font-bold'
                      : ''
                  }
                >
                  <td className="border border-gray-400 px-1 py-1">{rank + 1}</td>
                  <td className="border border-gray-400 px-1 py-1">{player.name}</td>
                  <td className="border border-gray-400 px-1 py-1">{player.score}</td>
                  <td className="border border-gray-400 px-1 py-1">
                    <button
                      className="bg-purple-600 text-white px-3 py-1 rounded"
                      onClick={() => scorePlayer(player.originalIndex)}
                    >
                      Calculate Score
                    </button>
                  </td>
                  <td className="border border-gray-400 px-3 py-1 space-x-1">
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded"
                      onClick={() => quickAdjustScore(player.originalIndex, 10)}
                    >
                      +10
                    </button>
                    <button
                      onClick={() => quickAdjustScore(player.originalIndex, 1)}
                    >
                      +1
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => quickAdjustScore(player.originalIndex, -1)}
                    >
                      -1
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
