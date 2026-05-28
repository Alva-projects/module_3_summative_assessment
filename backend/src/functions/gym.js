const connectDB = require("../config/db");
const Gym = require("../models/Gym");

const createGym = async (name, location) => {
  try {
    const gym = await Gym.create({ name, location });
    return gym;
  } catch (err) {
    console.error("Error creating gym:", err);
    // throw new Error("Failed to create gym");
  }
};

module.exports = {
  createGym,
};
