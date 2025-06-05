'use client';

import React, { useState, useEffect, useRef } from 'react';

type Player = {
  name: string;
  score: number;
  originalIndex: number;
};

export default function GamePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [undoStack, setUndoStack] = useState<Player[][]>([]);
  const [showAddPlayers, setShowAddPlayers] = useState(true);
  const [inputNames, setInputNames] = useState('');
  const [round, setRound] = useState(1);
  const [overtakeIndexes, setOvertakeIndexes] = useState<number[]>([]);
  const prevRanksRef = useRef<number[]>([]);
  const [gameId, setGameId] = useState<string | null>(null);


  // Add players from comma separated input
  const addPlayers = () => {
    const newPlayers = inputNames
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
      .map((name, i) => ({ name, score: 0, originalIndex: i }));

    if (newPlayers.length > 0) {
      setPlayers(newPlayers);
      setUndoStack([]);
      setShowAddPlayers(false);
      setInputNames('');
      setRound(1);
      prevRanksRef.current = newPlayers.map((_, i) => i); // reset rank tracking
      setOvertakeIndexes([]);
    }
  };

  const [joinGameId, setJoinGameId] = useState('');

  const joinGame = async () => {
    if (!joinGameId) return;
    try {
      const res = await fetch(`http://localhost:3001/game/${joinGameId}`);
      if (!res.ok) {
        alert('Game not found!');
        return;
      }
      const game = await res.json();
      setPlayers(game.players);
      setRound(game.round);
      setShowAddPlayers(false);
      setGameId(joinGameId);
    } catch (err) {
      console.error('Failed to load game:', err);
      alert('Error loading game');
    }
  };

  // Undo last change
  const undo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setPlayers(last);
    setUndoStack((stack) => stack.slice(0, stack.length - 1));
  };

  // Reset scores to zero and reset round to 1
  const reset = () => {
    setUndoStack((stack) => [...stack, players]);
    setPlayers(players.map((p) => ({ ...p, score: 0 })));
    setRound(1);  // Reset round here
  };


  // New Game - clear everything, back to add players
  const newGame = () => {
    setPlayers([]);
    setUndoStack([]);
    setShowAddPlayers(true);
    setRound(1);
    setOvertakeIndexes([]);
    prevRanksRef.current = [];
  };

  // Add score: prompt for n, add 10 + n²
  const addScore = (index: number) => {
    const nStr = prompt(`Sets won for ${players[index].name}`);
    if (nStr === null) return; // Cancelled
    const n = parseInt(nStr, 10);
    if (isNaN(n)) {
      alert('Please enter a valid number.');
      return;
    }

    const createGame = async (players: Player[]) => {
      const res = await fetch('http://localhost:3001/new-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players }),
      });
      const data = await res.json();
      setGameId(data.gameId); // store this in state
    };

    const loadGame = async (gameId: string) => {
      const res = await fetch(`http://localhost:3001/game/${gameId}`);
      if (!res.ok) return alert('Game not found!');
      const game = await res.json();
      setPlayers(game.players);
      setRound(game.round);
    };

    const updateGame = async () => {
      if (!gameId) return;
      await fetch(`http://localhost:3001/game/${gameId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players, round }),
      });
    };



    const scoreToAdd = 10 + Math.pow(n, 2);

    const prevPlayers = JSON.parse(JSON.stringify(players));
    const newPlayers = [...players];
    newPlayers[index] = {
      ...newPlayers[index],
      score: newPlayers[index].score + scoreToAdd,
    };

    setUndoStack((stack) => [...stack, prevPlayers]);
    setPlayers(newPlayers);
  };

  // Subtract score: prompt for x, subtract x²
  const subtractScore = (index: number) => {
    const xStr = prompt(`sets lost ${players[index].name}`);
    if (xStr === null) return; // Cancelled
    const x = parseInt(xStr, 10);
    if (isNaN(x)) {
      alert('Please enter a valid number.');
      return;
    }

    const scoreToSubtract = Math.pow(x, 2);

    const prevPlayers = JSON.parse(JSON.stringify(players));
    const newPlayers = [...players];
    newPlayers[index] = {
      ...newPlayers[index],
      score: newPlayers[index].score - scoreToSubtract,
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

  // Sort players descending by score (only when Next Round/Rank clicked)
  const sortedPlayers = players
    .map((p, i) => ({ ...p, originalIndex: p.originalIndex ?? i }));

  // Detect overtakes when players change (optional, can keep this or remove)
  useEffect(() => {
    if (prevRanksRef.current.length === 0) {
      prevRanksRef.current = sortedPlayers.map((p) => p.originalIndex);
      return;
    }

    const prevRanks = prevRanksRef.current;
    const newRanks = sortedPlayers
      .slice()
      .sort((a, b) => b.score - a.score)
      .map((p) => p.originalIndex);

    const overtakes = newRanks.reduce<number[]>((acc, playerIndex, newPos) => {
      const prevPos = prevRanks.indexOf(playerIndex);
      if (prevPos > newPos) acc.push(playerIndex);
      return acc;
    }, []);

    if (overtakes.length > 0) {
      setOvertakeIndexes(overtakes);
      const timer = setTimeout(() => setOvertakeIndexes([]), 2000);
      return () => clearTimeout(timer);
    }

    prevRanksRef.current = newRanks;
  }, [players]);

  // Next Round / Rank button logic: sort players descending by score and update prevRanksRef
  const handleNextRound = () => {
    setRound((prev) => prev + 1);
    const newRanks = players
      .slice()
      .sort((a, b) => b.score - a.score)
      .map((p) => p.originalIndex);
    prevRanksRef.current = newRanks;
    setPlayers((prev) =>
      [...prev].sort((a, b) => b.score - a.score) // sort players state to reflect ranking
    );
  };

  // Highlight leader row
  const maxScore = players.length ? Math.max(...players.map((p) => p.score)) : 0;

  return (
    <main>
      <h1 className="text-3xl font-bold">Wee FamBam's Spectacular Addiction</h1>
      <h2 className="text-xl mb-6">German Bridge Scoreboard</h2>

      <section className="mb-6">
        {/* <h2 className="mb-2">Join existing game by ID:</h2>
        <input
          type="text"
          className="border px-3 py-2 rounded w-full max-w-md"
          value={joinGameId}
          onChange={(e) => setJoinGameId(e.target.value)}
          placeholder="Enter Game ID"
          onKeyDown={(e) => e.key === 'Enter' && joinGame()}
        /> */}
        {/* <br />
        <button
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={joinGame}
        >
          Join Game
        </button> */}
      </section>


      {showAddPlayers && (
        <section className="mb-6">
          

          <h2 className="mb-2">Add players (comma separated):</h2>
          <input
            type="text"
            className="border px-3 py-2 rounded w-full max-w-md"
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

          {/* {gameId && (
            <div className="mb-4 text-sm text-gray-700">
              <strong>Game ID:</strong> {gameId}
            </div>
          )} */}
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
              Reset Game
            </button>
          </div>

          <div className="table-wrapper max-w-full overflow-x-auto p-2">
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-semibold">Round: {round}</div>
              <button
                onClick={handleNextRound}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Check Ranking
              </button>
            </div>
            <table className="w-full border-collapse border">
              <thead>
                <tr>
                  <th className="border border-gray-400 px-3 py-1 w-20">Player</th>
                  <th className="border border-gray-400 px-3 py-1 w-10">Score</th>
                  <th className="border border-gray-400 w-20">Adjust Score</th>
                  <th className="border border-gray-400 px-3 py-1 w-40">
                    Quick Add/Subtract
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player) => {
                  const isOvertaking = overtakeIndexes.includes(player.originalIndex);
                  const isLeader = player.score === maxScore && maxScore !== 0;

                  return (
                    <tr
                      key={player.originalIndex}
                      className={`${isLeader ? 'bg-yellow-200 font-bold' : ''} ${isOvertaking ? 'overtake' : ''
                        }`}
                    >
                      <td className="border border-gray-400 px-1 py-1">{player.name}</td>
                      <td className="border border-gray-400 px-1 py-1">{player.score}</td>
                      <td className="border border-gray-400 px-1 py-1 space-x-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded"
                          onClick={() => addScore(player.originalIndex)}
                        >
                          +
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded"
                          onClick={() => subtractScore(player.originalIndex)}
                        >
                          -
                        </button>
                      </td>
                      <td className="border border-gray-400 px-3 py-1 space-x-1">
                        <div className="button-group flex space-x-1">
                          <button
                            className="bg-green-600 text-white px-2 py-1 rounded"
                            onClick={() => quickAdjustScore(player.originalIndex, 10)}
                          >
                            +10
                          </button>
                          <button
                            className="bg-green-600 text-white px-2 py-1 rounded"
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
