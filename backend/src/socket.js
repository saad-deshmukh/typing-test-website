import { Server } from "socket.io";
import { Game, Player, User, GameStats } from "./models/index.js";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const disconnectTimeouts = new Map(); // Tracks users currently disconnected
const playerProgressMap = new Map();  // Tracks user progress

// Define the Rate Limit Map
const rateLimitMap = new Map(); 

const typingTexts = [
  "The quick brown fox jumps over the lazy dog.",
  "To be or not to be, that is the question.",
  "All that glitters is not gold.",
  "A journey of a thousand miles begins with a single step.",
  "Coding is not just about logic, it is about art and structure."
];

export const socketAuth = (io) => {
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie;
      if (!cookieHeader) {
        return next(new Error("No cookies sent"));
      }

      const cookies = cookie.parse(cookieHeader);
      const token = cookies.access_token; 

      if (!token) {
        return next(new Error("No auth token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = decoded.user; // { id, username }
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });
};

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    }
  });

  socketAuth(io);

  io.on("connection", (socket) => {
    console.log(` User connected: ${socket.id}`);

    const updateRoom = async (roomToken) => {
      try {
        const game = await Game.findOne({
          where: { roomToken },
          include: {
            model: Player,
            as: "players",
            include: { model: User, attributes: ["id", "username"] }
          }
        });
        if (game) {
          io.to(roomToken).emit("updateRoom", game.players);
        }
      } catch (error) {
        console.error(`Error updating room ${roomToken}:`, error);
      }
    };

    const checkAndEndGame = async (gameId, roomToken) => {
      const currentPlayers = await Player.findAll({ where: { gameId } });

      if (currentPlayers.length === 0) {
        await Game.destroy({ where: { id: gameId } });
        return;
      }

      const allFinished = currentPlayers.every(p => p.time !== null);

      if (allFinished) {
        await Game.update({ status: "finished" }, { where: { id: gameId } });

        for (const p of currentPlayers) {
          if (p.userId && p.time) {
            await GameStats.create({
              userId: p.userId,
              gameId: gameId,
              playerId: p.id,
              wpm: p.speed,
              accuracy: p.accuracy,
              wordsTyped: Math.round((p.speed * p.time) / 60) || 0,
              timeTaken: p.time,
              errorsMade: 0,
              isMultiplayer: true,
              playedAt: new Date()
            });
          }
        }

        // Include usernames for ALL players 
        const resultsWithUsers = await Player.findAll({
          where: { gameId },
          include: [{
            model: User,
            attributes: ['username'],
            required: true  //  Force JOIN
          }]
        });
        const sortedResults = resultsWithUsers.sort((a, b) => b.speed - a.speed);

        io.to(roomToken).emit("endGame", sortedResults.map(p => ({
          id: p.id,
          userId: p.userId,
          speed: p.speed,
          accuracy: p.accuracy || 100,
          time: p.time,
          isHost: p.isHost,
          username: p.User.username 
        })));
        console.log(`Game ended in room: ${roomToken}`);
      }
    };

    socket.on("subscribeToRoom", async ({ roomToken }) => {
      try {
        const userId = socket.user.id;

        // Load game
        const game = await Game.findOne({ where: { roomToken } });
        if (!game) return;

        //  Resolve player SERVER-SIDE 
        const player = await Player.findOne({
          where: {
            gameId: game.id,
            userId: userId
          }
        });

        if (!player) {
          console.warn("Unauthorized room join attempt", {
            roomToken,
            userId
          });
          return;
        }

        const playerId = player.id;

        // Clear reconnect timeout safely
        if (disconnectTimeouts.has(playerId)) {
          clearTimeout(disconnectTimeouts.get(playerId));
          disconnectTimeouts.delete(playerId);
        }

        // Attach trusted identity to socket
        socket.playerId = playerId;
        socket.roomToken = roomToken;
        socket.join(roomToken);

        console.log(
          ` Player ${playerId} (${socket.user.username}) joined room ${roomToken}`
        );

        // Restore in-progress game state
        if (game.status === "in-progress") {
          const savedData = playerProgressMap.get(playerId);

          socket.emit("syncState", {
            startTime: game.startTime,
            gameText: game.text,
            status: game.status,
            existingProgress: savedData ? savedData.progress : 0,
            currentWordIndex: savedData ? savedData.wordIndex : 0
          });

          //  Send other players’ progress
          const allPlayersProgress = [];

          for (const [pid, data] of playerProgressMap.entries()) {
            if (String(pid) !== String(playerId) && data) {
              allPlayersProgress.push({
                playerId: pid,
                progress: data.progress,
                accuracy: data.accuracy,
                wpm: data.wpm
              });
            }
          }

          if (allPlayersProgress.length > 0) {
            socket.emit("bulkProgressUpdate", allPlayersProgress);
          }
        }

        //  Update lobby players list
        updateRoom(roomToken);

      } catch (err) {
        console.error(" subscribeToRoom error:", err);
      }
    });


    socket.on("cancelGame", async ({ roomToken }) => {
      try {
        const game = await Game.findOne({ where: { roomToken } });
        const player = await Player.findOne({ where: { id: socket.playerId } });

        if (game && player && player.isHost) {
          io.to(roomToken).emit("roomDestroyed", "Host cancelled the game.");
          await Player.destroy({ where: { gameId: game.id } });
          await Game.destroy({ where: { id: game.id } });
          playerProgressMap.clear();
        }
      } catch (err) {
        console.error("Error cancelling game:", err);
      }
    });

    socket.on("playerProgress", async ({ roomToken, progress, accuracy, wpm, wordCount, wordIndex }) => {
      //  Rate Limit Check (Max 1 update every 50ms)
      const now = Date.now();
      const lastUpdate = rateLimitMap.get(socket.id) || 0;
      if (now - lastUpdate < 50) return; // Ignore spam
      rateLimitMap.set(socket.id, now);

      if (socket.playerId) {
        playerProgressMap.set(socket.playerId, {
          progress,
          accuracy,
          wpm: wpm,
          wordIndex: wordIndex || 0
        });
      }

      socket.broadcast.to(roomToken).emit("progressUpdate", {
        playerId: socket.playerId,
        progress,
        accuracy,
        wpm: wpm
      });
    });

    socket.on("requestStartGame", async ({ roomToken }) => {
      try {
        const game = await Game.findOne({ where: { roomToken } });
        if (game && game.status === "waiting") {
          const gameText = typingTexts[Math.floor(Math.random() * typingTexts.length)];

          await game.update({
            status: "in-progress",
            startTime: new Date(),
            text: gameText
          });

          playerProgressMap.clear();

          io.to(roomToken).emit("startGame", {
            gameText,
            startTime: game.startTime,
            gameId: game.id
          });
        }
      } catch (error) {
        console.error("Error starting game:", error);
      }
    });

    socket.on("playerFinished", async ({ roomToken, stats }) => {
      try {
        const game = await Game.findOne({ where: { roomToken }, include: "players" });
        const player = game.players.find(p => p.id === socket.playerId);

        if (player && !player.time) {
          await Player.update({
            time: stats.timeTaken,
            speed: stats.wpm,
            accuracy: stats.accuracy
          }, { where: { id: player.id } });

          if (typeof playerProgressMap !== "undefined") {
            playerProgressMap.set(socket.playerId, {
              progress: 100,
              accuracy: stats.accuracy,
              wpm: stats.wpm,
              wordIndex: 99999
            });
          }

          io.to(roomToken).emit("progressUpdate", {
            playerId: socket.playerId,
            progress: 100,
            accuracy: stats.accuracy,
            wpm: stats.wpm
          });

          updateRoom(roomToken);
          await checkAndEndGame(game.id, roomToken);
        }
      } catch (error) {
        console.error("Error in playerFinished:", error);
      }
    });

    socket.on("disconnect", async () => {
      //  Clean up Rate Limit Memory
      rateLimitMap.delete(socket.id);

      if (socket.playerId && socket.roomToken) {
        const playerId = socket.playerId;
        const roomToken = socket.roomToken;

        const timeoutId = setTimeout(async () => {
          try {
            const game = await Game.findOne({ where: { roomToken } });

            if (game) {
              const leavingPlayer = await Player.findByPk(playerId);

              if (leavingPlayer) {
                if (leavingPlayer.isHost) {
                  io.to(roomToken).emit("roomDestroyed", "Host disconnected. Room closed.");
                  await Player.destroy({ where: { gameId: game.id } });
                  await Game.destroy({ where: { id: game.id } });
                  playerProgressMap.clear();
                } else {
                  await Player.destroy({ where: { id: playerId } });
                  playerProgressMap.delete(playerId);

                  if (game.status === "waiting") {
                    updateRoom(roomToken);
                  } else if (game.status === "in-progress") {
                    await checkAndEndGame(game.id, roomToken);
                  }
                }
              }
            }
            disconnectTimeouts.delete(playerId);
          } catch (err) {
            console.error("Error handling disconnect:", err);
          }
        }, 10000);

        disconnectTimeouts.set(playerId, timeoutId);
      }
    });
  });
}

export default initSocket;