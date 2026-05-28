// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { signInWithEmailPassword } = require("../auth2");
const verifyToken = require("../routes/authRoutes");

// POST /login - Login and get token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email and password are required",
    });
  }

  try {
    const result = await signInWithEmailPassword(email, password);
    res.json({
      success: true,
      message: "Login successful",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(401).json({
      success: false,
      error: error.message || "Authentication failed",
    });
  }
});

// GET /verify - Verify token (protected)
router.get("/verify", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    user: {
      uid: req.user.uid,
      email: req.user.email,
      email_verified: req.user.email_verified,
    },
  });
});

module.exports = router;
