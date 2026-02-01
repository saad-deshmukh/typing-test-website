import express from "express";
import { signup, login, logout, getMe } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

//Logout route (clears cookie)
router.post("/logout", authMiddleware, logout);

// Persist login on refresh (checks cookie)
// used authMiddleware here to verify the cookie before sending user data
router.get("/me", authMiddleware, getMe);

export default router;