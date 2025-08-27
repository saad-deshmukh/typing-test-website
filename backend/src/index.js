const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");

const sequelize = require("./config/db");
const initSocket = require("./socket");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes"); // You were missing this import

const app = express();

// --- Middleware Setup (Order is CRITICAL) ---

// 1. CORS Middleware: Handles cross-origin requests. Must come first.
app.use(cors({ origin: "http://localhost:5173" })); // Be specific for security

// 2. Request Logger: A simple middleware to see all incoming requests.
app.use((req, res, next) => {
  console.log(`➡️  Received Request: ${req.method} ${req.path}`);
  next();
});

// 3. JSON Body Parser: This allows your server to read the JSON data from the signup form.
app.use(express.json());

// --- API Routes ---
// These must come AFTER the middleware.
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes); // You were missing this line

// --- Server and Database Initialization ---

// Health Check Route
app.get("/", (req, res) => res.send("Server is running..."));

// Sync Database
sequelize.sync({ alter: true })
  .then(() => console.log("✅ Database synced"))
  .catch(err => console.error("❌ Error syncing database:", err));

// Create HTTP server & attach Socket.IO
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
