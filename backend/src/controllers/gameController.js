import { nanoid } from "nanoid";
import { Game, Player, User } from "../models/index.js";
import { Op } from "sequelize"; //

export const createRoom = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is already in an active game 
    const activePlayer = await Player.findOne({
      where: { userId },
      include: {
        model: Game,
        where: {
          status: { [Op.or]: ["waiting", "in-progress"] }
        }
      }
    });

    if (activePlayer && activePlayer.Game) {
      return res.status(403).json({
        error: "ACTIVE_GAME_EXISTS",
        message: "You are already in an active game.",
        roomToken: activePlayer.Game.roomToken
      });
    }

    // Generate a unique token
    const roomToken = nanoid(6);

    // Create the Game instance
    const newGame = await Game.create({
      roomToken,
      status: "waiting",
    });

    // Create the Player instance for the host
    const hostPlayer = await Player.create({
      userId: userId,
      gameId: newGame.id,
      isHost: true,
    });

    res.status(201).json({
      message: "Game created successfully!",
      roomToken: newGame.roomToken,
      playerId: hostPlayer.id,
    });

  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ error: "Failed to create game." });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomToken } = req.body;
    const userId = req.user.id;

    if (!roomToken) {
      return res.status(400).json({ error: "Room token is required." });
    }

    const game = await Game.findOne({ where: { roomToken } });

    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }
    if (game.status !== "waiting") {
      return res.status(403).json({ error: "This game is not available to join." });
    }

    // Check if user is already in different active game
    const activePlayer = await Player.findOne({
      where: {
        userId,
        gameId: { [Op.ne]: game.id }
      },
      include: {
        model: Game,
        where: {
          status: { [Op.or]: ["waiting", "in-progress"] }
        }
      }
    });

    if (activePlayer && activePlayer.Game) {
      return res.status(403).json({
        error: "ACTIVE_GAME_EXISTS",
        message: `You are already in another active game (${activePlayer.Game.roomToken}).`,
        roomToken: activePlayer.Game.roomToken
      });
    }

    const playerCount = await Player.count({
      where: { gameId: game.id }
    });

    if (playerCount >= 5) {
      return res.status(403).json({ error: "Room is full (Max 5 players)." });
    }

    const [player, created] = await Player.findOrCreate({
      where: { userId: userId, gameId: game.id },
      defaults: { isHost: false }
    });

    res.status(200).json({
      message: created ? "Joined game successfully!" : "Rejoining game.",
      roomToken: game.roomToken,
      playerId: player.id,
      gameId: game.id
    });

  } catch (error) {
    console.error("Error joining game:", error);
    res.status(500).json({ error: "Failed to join game." });
  }
};

export const getGame = async (req, res) => {
  try {
    const { roomToken } = req.params;
    const game = await Game.findOne({
      where: { roomToken },
      include: {
        model: Player,
        as: "players",
        include: {
          model: User,
          attributes: ["id", "username"]
        }
      }
    });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.status(200).json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ error: "Failed to fetch game data." });
  }
};

export const leaveGame = async (req, res) => {
  try {
    const userId = req.user.id;

    const activeEntries = await Player.findAll({
      where: { userId },
      include: {
        model: Game,
        where: { status: { [Op.or]: ["waiting", "in-progress"] } }
      }
    });

    if (activeEntries.length > 0) {
      const playerIdsToDelete = activeEntries.map(entry => entry.id);

      await Player.destroy({
        where: {
          id: playerIdsToDelete
        }
      });

    //  console.log(` Cleaned up ${activeEntries.length} active game sessions for user ${userId}`);
      return res.status(200).json({ message: "Left all active games." });
    }

    res.status(200).json({ message: "No active games found." });

  } catch (error) {
    console.error("Error leaving game:", error);
    res.status(500).json({ error: "Failed to leave game." });
  }
};

export const checkActiveGame = async (req, res) => {
  try {
    const userId = req.user.id;

    const activePlayer = await Player.findOne({
      where: { userId },
      include: {
        model: Game,
        where: { status: { [Op.or]: ["waiting", "in-progress"] } }
      }
    });

    if (activePlayer && activePlayer.Game) {
      return res.status(200).json({
        active: true,
        roomToken: activePlayer.Game.roomToken,
        gameId: activePlayer.Game.id,
        playerId: activePlayer.id,
        status: activePlayer.Game.status
      });
    }

    res.status(200).json({ active: false });

  } catch (error) {
    console.error("Error checking status:", error);
    res.status(500).json({ error: "Check failed" });
  }
};
