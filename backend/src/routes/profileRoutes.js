const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const db = require("../db/queries");

// GET /profile (protected)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;
    const profile = await db.getUserProfile(uid, email, name);
    const gyms = await db.getUserGyms(uid);
    const reviews = await db.getUserReviews(uid);
    res.json({
      profile,
      stats: {
        totalGymsCreated: gyms.length,
        totalReviewsWritten: reviews.length,
      },
      gyms,
      reviews,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

module.exports = router;
