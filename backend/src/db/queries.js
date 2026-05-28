const mongoose = require("mongoose");
const Gym = require("../models/gym");
const Review = require("../models/review");
const User = require("../models/user");

const gymAggregatePipeline = [
  {
    $lookup: {
      from: "reviews",
      localField: "_id",
      foreignField: "gymId",
      as: "reviews",
    },
  },
  {
    $addFields: {
      id: { $toString: "$_id" },
      review_count: { $size: "$reviews" },
      average_rating: {
        $cond: {
          if: { $gt: [{ $size: "$reviews" }, 0] },
          then: { $round: [{ $avg: "$reviews.rating" }, 1] },
          else: null,
        },
      },
    },
  },
  { $project: { reviews: 0 } },
];

const getAllGyms = async () => {
  return Gym.aggregate([...gymAggregatePipeline, { $sort: { createdAt: 1 } }]);
};

const getGymById = async (id) => {
  const result = await Gym.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    ...gymAggregatePipeline,
  ]);
  return result[0] || null;
};

const createGym = async (gymData, userId) => {
  const { name, location, description } = gymData;
  const gym = new Gym({ name, location, description, createdBy: userId });
  await gym.save();
  const obj = gym.toObject();
  return { ...obj, id: obj._id.toString() };
};

const getReviewsByGymId = async (gymId) => {
  const reviews = await Review.find({ gymId }).sort({ createdAt: -1 }).lean();
  return reviews.map((r) => ({
    ...r,
    id: r._id.toString(),
    user_email: r.userEmail,
    created_at: r.createdAt,
  }));
};

const createReview = async (gymId, reviewData, userId) => {
  const { rating, comment, userEmail } = reviewData;
  const review = new Review({ gymId, userId, userEmail, rating, comment: comment || null });
  await review.save();
  return review.toObject();
};

const hasUserReviewed = async (gymId, userId) => {
  const review = await Review.findOne({ gymId, userId });
  return !!review;
};

const getUserProfile = async (uid, email, displayName) => {
  const user = await User.findOneAndUpdate(
    { uid },
    { uid, email, displayName },
    { upsert: true, new: true }
  ).lean();
  return {
    uid: user.uid,
    email: user.email,
    display_name: user.displayName,
    created_at: user.createdAt,
  };
};

const getUserGyms = async (uid) => {
  return Gym.aggregate([
    { $match: { createdBy: uid } },
    ...gymAggregatePipeline,
    { $sort: { createdAt: -1 } },
  ]);
};

const getUserReviews = async (uid) => {
  const reviews = await Review.find({ userId: uid })
    .populate("gymId", "name")
    .sort({ createdAt: -1 })
    .lean();
  return reviews.map((r) => ({
    id: r._id.toString(),
    gym_id: r.gymId._id.toString(),
    gym_name: r.gymId.name,
    rating: r.rating,
    comment: r.comment,
    user_email: r.userEmail,
    created_at: r.createdAt,
  }));
};

module.exports = {
  getAllGyms,
  getGymById,
  createGym,
  getReviewsByGymId,
  createReview,
  hasUserReviewed,
  getUserProfile,
  getUserGyms,
  getUserReviews,
};
