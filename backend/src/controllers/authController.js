
import { User } from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//  SIGNUP

export const signup = async (req, res) => {
  try {
    
    const { username, email, password } = req.body;

    // Manual validation FIRST 
    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: 'Username, email, and password are required'
      });
    }

    if (username.trim().length < 3 || username.trim().length > 20) {
      return res.status(400).json({
        message: 'Username must be 3-20 characters'
      });
    }

    const hash = await bcrypt.hash(password, 10);

    // TRIM before Sequelize
    const newUser = await User.create({
      username: username.trim(),
      email: email.trim(),
      passwordHash: hash
    });

    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email
    };

    res.status(201).json({
      message: "User created",
      user: userResponse
    });

  } catch (err) {
    console.error(' FULL ERROR:', err); 

    //  HANDLE SEQUELIZE VALIDATION PROPERLY
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(e => e.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    //  DUPLICATE USER (unique constraint)
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: 'Username or email already exists'
      });
    }

    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};


//  LOGIN (Sets the HttpOnly Cookie)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // SET JWT AS HTTPONLY COOKIE
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: true, // False in dev, True in prod
      sameSite: "none", // Lax is often better for dev
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // SEND USER ONLY
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  LOGOUT (Clears the Cookie)
export const logout = (req, res) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
};

//  GET CURRENT USER (For Page Refresh)
// This verifies the cookie and returns user data
export const getMe = async (req, res) => {
  try {
    //  Disable caching completely
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "email", "totalGames", "bestWpm", "averageWpm"]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

