const express = require("express");
const path = require("path");
const gymRoutes = require("./routes/gymRoutes");
const profileRoutes = require("./routes/profileRoutes");
const authRoutes = require("./middleware/authRoutes");

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.static(path.join(__dirname, "../../frontend")));

app.use("/gyms", gymRoutes);
app.use("/profile", profileRoutes);
app.use("/auth", authRoutes);

app.get("/config", (req, res) => {
  res.json({
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseAuthDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  });
});

module.exports = app;
