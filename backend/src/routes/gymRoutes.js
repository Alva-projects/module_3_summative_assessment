// routes/gymRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authRoutes");
const db = require("../db/queries");

// ============ PUBLIC ROUTES ============

// GET /gyms - Get all gyms (public)
router.get("/", async (req, res) => {
  try {
    const gyms = await db.getAllGyms();
    res.json({
      success: true,
      count: gyms.length,
    });
  } catch (err) {
    console.error("Error fetching gyms:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch gyms",
    });
  }
});

// GET /gyms/:id - Get single gym by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = parseInt(id);

    if (isNaN(gymId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid gym ID format",
      });
    }

    const gym = await db.getGymById(gymId);

    if (!gym) {
      return res.status(404).json({
        success: false,
        error: `Gym with ID ${id} not found`,
      });
    }

    // Get reviews for this gym
    const reviews = await db.getReviewsByGymId(gymId);

    res.json({
      success: true,
      data: {
        ...gym,
        reviews,
      },
    });
  } catch (err) {
    console.error("Error fetching gym:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch gym",
    });
  }
});

// ============ PROTECTED ROUTES ============

// POST /gyms - Create new gym (protected)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, location } = req.body;

    // Validate required fields
    if (!name || !location) {
      return res.status(400).json({
        success: false,
        error: "Name and location are required",
      });
    }

    const newGym = await db.createGym({ name, location }, req.user.uid);

    res.status(201).json({
      success: true,
      message: "Gym created successfully",
      data: newGym,
    });
  } catch (err) {
    console.error("Error creating gym:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create gym",
    });
  }
});

// POST /gyms/:id/reviews - Add review to gym (protected)
router.post("/:id/reviews", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = parseInt(id);
    const { rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5",
      });
    }

    // Check if gym exists
    const gym = await db.getGymById(gymId);
    if (!gym) {
      return res.status(404).json({
        success: false,
        error: "Gym not found",
      });
    }

    // Check if user already reviewed this gym
    const hasReviewed = await db.hasUserReviewed(gymId, req.user.uid);
    if (hasReviewed) {
      return res.status(400).json({
        success: false,
        error: "You have already reviewed this gym",
      });
    }

    const newReview = await db.createReview(
      gymId,
      { rating, comment: comment || null },
      req.user.uid,
    );

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: newReview,
    });
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create review",
    });
  }
});

router.get("/gyms/:id", verifyToken, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

module.exports = router;

// routes/gymRoutes.js
