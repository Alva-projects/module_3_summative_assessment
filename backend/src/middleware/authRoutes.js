// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { signInWithEmailPassword } = require("../middleware/authenticate");
require("dotenv").config();

router.post("/gyms", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  try {
    const result = await signInWithEmailPassword(email, password);

    res.json({
      message: "User logged in successfully",
      user: result.user,
      token: result.idToken,
    });
  } catch (error) {
    res.status(401).json({
      error: error.message || "Authentication failed",
    });
  }
});

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

router.get("/gyms/:id", verifyToken, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

module.exports = router;
