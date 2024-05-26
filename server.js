const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let games = {}; // Store multiple games

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('createGame', ({ gameId }) => {
    if (!games[gameId]) {
      games[gameId] = {
        players: [
          { id: 0, pieces: [{ id: 0, position: 1 }, { id: 1, position: 1 }, { id: 2, position: 1 }, { id: 3, position: 1 }] },
          { id: 1, pieces: [{ id: 0, position: 1 }, { id: 1, position: 1 }, { id: 2, position: 1 }, { id: 3, position: 1 }] },
          { id: 2, pieces: [{ id: 0, position: 1 }, { id: 1, position: 1 }, { id: 2, position: 1 }, { id: 3, position: 1 }] },
          { id: 3, pieces: [{ id: 0, position: 1 }, { id: 1, position: 1 }, { id: 2, position: 1 }, { id: 3, position: 1 }] }
        ],
        currentPlayer: 0,
      };
      socket.join(gameId);
      socket.emit('gameJoined', { playerId: 0, gameState: games[gameId] });
      console.log(`Game ${gameId} created`);
    } else {
      socket.emit('error', 'Game already exists');
    }
  });

  socket.on('joinGame', ({ gameId }) => {
    if (games[gameId]) {
      socket.join(gameId);
      socket.emit('gameJoined', { playerId: 1, gameState: games[gameId] });
      console.log(`Player joined game ${gameId}`);
    } else {
      socket.emit('error', 'Game not found');
    }
  });

  socket.on('movePiece', ({ gameId, playerId, pieceId, diceRoll }) => {
    const game = games[gameId];
    if (game) {
      const player = game.players[playerId];
      if (player) {
        const piece = player.pieces.find(p => p.id === pieceId);
        if (piece) {
          piece.position += diceRoll; // Update the piece's position
        }

        // Change player turn
        game.currentPlayer = (game.currentPlayer + 1) % game.players.length;

        // Broadcast updated game state to all clients in the game
        io.to(gameId).emit('gameState', game);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => console.log('Listening on port 4000'));
