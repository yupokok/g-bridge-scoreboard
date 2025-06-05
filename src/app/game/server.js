const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const redis = createClient();
redis.connect().catch(console.error);

app.post('/new-game', async (req, res) => {
  const gameId = uuidv4().slice(0, 6); // short game ID
  const gameData = {
    players: req.body.players || [],
    round: 1,
    scores: req.body.players.map(() => 0),
  };

  await redis.set(`game:${gameId}`, JSON.stringify(gameData));
  res.json({ gameId });
});

app.get('/game/:id', async (req, res) => {
  const raw = await redis.get(`game:${req.params.id}`);
  if (!raw) return res.status(404).json({ error: 'Game not found' });

  const game = JSON.parse(raw);
  res.json(game);
});

app.post('/game/:id/update', async (req, res) => {
  const gameId = req.params.id;
  const gameData = req.body;

  await redis.set(`game:${gameId}`, JSON.stringify(gameData));
  res.json({ status: 'ok' });
});

app.listen(3001, () => {
  console.log('Server listening on http://localhost:3001');
});

