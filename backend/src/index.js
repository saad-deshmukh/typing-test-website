const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/db");
const User = require("./models/user");
const authRoutes = require("./routes/authRoutes");



const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
sequelize.sync({ alter: true }) // creates tables if they not exist 
  .then(() => console.log("✅ Database synced"))
  .catch(err => console.error(err));

app.get("/", (req, res) => res.send("Server is running..."));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
