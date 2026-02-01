import express from "express";
import * as gameController from "../controllers/gameController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.post("/create-room", authMiddleware, gameController.createRoom);
router.post("/join-room", authMiddleware, gameController.joinRoom);
router.post("/leave", authMiddleware, gameController.leaveGame);
router.get("/status", authMiddleware, gameController.checkActiveGame);
router.get("/room/:roomToken", authMiddleware, gameController.getGame);

export default router;
