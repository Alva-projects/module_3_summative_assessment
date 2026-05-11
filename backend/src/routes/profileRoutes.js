// routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authRoutes");
const db = require("../db/queries");

// GET /profile - Get user profile (protected)
router.get("/", verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;

    // Get user profile
    const profile = await db.getUserProfile(uid);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "User profile not found",
      });
    }

    // Get user's gyms
    const userGyms = await db.getUserGyms(uid);

    // Get user's reviews
    const userReviews = await db.getUserReviews(uid);

    res.json({
      success: true,
      data: {
        profile,
        stats: {
          totalGymsCreated: userGyms.length,
          totalReviewsWritten: userReviews.length,
        },
        gyms: userGyms,
        reviews: userReviews,
      },
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user profile",
    });
  }
});

// GET /profile/gyms - Get user's created gyms (protected)
router.get("/gyms", verifyToken, async (req, res) => {
  try {
    const userGyms = await db.getUserGyms(req.user.uid);
    res.json({
      success: true,
      count: userGyms.length,
      data: userGyms,
    });
  } catch (err) {
    console.error("Error fetching user gyms:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch your gyms",
    });
  }
});

// GET /profile/reviews - Get user's reviews (protected)
router.get("/reviews", verifyToken, async (req, res) => {
  try {
    const userReviews = await db.getUserReviews(req.user.uid);
    res.json({
      success: true,
      count: userReviews.length,
      data: userReviews,
    });
  } catch (err) {
    console.error("Error fetching user reviews:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch your reviews",
    });
  }
});

module.exports = router;
