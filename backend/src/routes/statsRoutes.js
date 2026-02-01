import express from "express";
import * as statsController from "../controllers/statsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/save", authMiddleware, statsController.saveGameResult);
router.get("/profile", authMiddleware, statsController.getUserStats);
router.get("/leaderboard", statsController.getLeaderboard);

export default router;

