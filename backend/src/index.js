import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import cookieParser from "cookie-parser";
import sequelize from "./config/db.js";
import initSocket from "./socket.js";
import rateLimit from "express-rate-limit";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import aiAnalysisRoutes from "./routes/aiAnalysis.js";

dotenv.config();

const app = express();

// CORS Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Request Logger
app.use((req, res, next) => {
  next();
});

// JSON Body Parser
app.use(express.json());

app.use(cookieParser());

// Rate Limiters

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: { error: "Too many login attempts" }
});
// Strict limiter for Auth (10 attempts per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50,  // covers 50 refreshes
  message: { error: "Too many auth requests." },
  //  Skip rate limit for /auth/me 
  skip: (req) => req.path === '/me'
});


// General limiter for API (100 requests per 15 min)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply Limiters to Routes
app.use("/api/auth/login", loginLimiter);  
app.use("/api/auth/me", authLimiter);       
app.use("/api/auth/logout", authLimiter);   
app.use("/api/auth/signup", loginLimiter);    
app.use("/api/auth", apiLimiter, authRoutes);           
app.use("/api/game", apiLimiter, gameRoutes); 
app.use("/api/stats", statsRoutes);       
app.use("/api", apiLimiter, aiAnalysisRoutes);
app.get("/", (req, res) => res.send("Server is running..."));

sequelize
  .sync()
  .then(() => console.log("Database synced"))
  .catch((err) => console.error("Error syncing database:", err));

// Create HTTP server & attach Socket.IO
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});