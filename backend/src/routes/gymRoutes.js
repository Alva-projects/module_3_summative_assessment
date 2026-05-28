const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const db = require("../db/queries");

// GET /gyms
router.get("/", async (req, res) => {
  try {
    const gyms = await db.getAllGyms();
    res.json(gyms);
  } catch (err) {
    console.error("Error fetching gyms:", err);
    res.status(500).json({ error: "Failed to fetch gyms" });
  }
});

// GET /gyms/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid gym ID" });
  }
  try {
    const gym = await db.getGymById(id);
    if (!gym) return res.status(404).json({ error: "Gym not found" });
    const reviews = await db.getReviewsByGymId(id);
    res.json({ gym, reviews });
  } catch (err) {
    console.error("Error fetching gym:", err);
    res.status(500).json({ error: "Failed to fetch gym" });
  }
});

// POST /gyms (protected)
router.post("/", verifyToken, async (req, res) => {
  const { name, location, description } = req.body;
  if (!name || !location) {
    return res.status(400).json({ error: "Name and location are required" });
  }
  try {
    const gym = await db.createGym({ name, location, description }, req.user.uid);
    res.status(201).json(gym);
  } catch (err) {
    console.error("Error creating gym:", err);
    res.status(500).json({ error: "Failed to create gym" });
  }
});

// POST /gyms/:id/reviews (protected)
router.post("/:id/reviews", verifyToken, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid gym ID" });
  }
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }
  try {
    const gym = await db.getGymById(id);
    if (!gym) return res.status(404).json({ error: "Gym not found" });

    const hasReviewed = await db.hasUserReviewed(id, req.user.uid);
    if (hasReviewed) {
      return res.status(400).json({ error: "You have already reviewed this gym" });
    }

    const review = await db.createReview(
      id,
      { rating, comment: comment || null, userEmail: req.user.email },
      req.user.uid
    );
    res.status(201).json(review);
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ error: "Failed to create review" });
  }
});

module.exports = router;
