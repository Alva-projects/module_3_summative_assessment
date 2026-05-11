// server.js
require("dotenv").config();
const express = require("express");
const gymRoutes = require("./routes/gymRoutes");
const profileRoutes = require("./routes/profileRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());

// Mount routes
app.use("/gyms", gymRoutes); // Gym routes (public + protected)
app.use("/profile", profileRoutes); // Profile routes (all protected)
app.use("/auth", authRoutes); // Auth routes (login, verify)

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Gym Reviews API Server",
    version: "1.0.0",
    endpoints: {
      public: {
        "GET /gyms": "Get all gyms",
        "GET /gyms/:id": "Get specific gym with reviews",
      },
      protected: {
        "POST /gyms": "Create a new gym (requires token)",
        "POST /gyms/:id/reviews": "Add review to gym (requires token)",
        "GET /profile": "Get user profile with stats (requires token)",
        "GET /profile/gyms": "Get gyms created by user (requires token)",
        "GET /profile/reviews": "Get reviews written by user (requires token)",
      },
      auth: {
        "POST /auth/login": "Login with email/password",
        "GET /auth/verify": "Verify token validity (requires token)",
      },
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`\n📝 Public Endpoints:`);
  console.log(`   GET    http://localhost:${PORT}/gyms`);
  console.log(`   GET    http://localhost:${PORT}/gyms/:id`);
  console.log(`\n🔒 Protected Endpoints (need token):`);
  console.log(`   POST   http://localhost:${PORT}/gyms`);
  console.log(`   POST   http://localhost:${PORT}/gyms/:id/reviews`);
  console.log(`   GET    http://localhost:${PORT}/profile`);
  console.log(`   GET    http://localhost:${PORT}/profile/gyms`);
  console.log(`   GET    http://localhost:${PORT}/profile/reviews`);
  console.log(`\n🔑 Auth Endpoints:`);
  console.log(`   POST   http://localhost:${PORT}/auth/login`);
  console.log(`   GET    http://localhost:${PORT}/auth/verify`);
});
