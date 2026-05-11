const pool = require("./index");

const getAllGyms = async () => {
  const result = await pool.query(`
    SELECT g.*, 
           COUNT(r.id) as review_count,
           ROUND(AVG(r.rating), 1) as average_rating
    FROM gyms g
    LEFT JOIN reviews r ON g.id = r.gym_id
    GROUP BY g.id
    ORDER BY g.id ASC
  `);

  return result.rows.map((gym) => ({
    ...gym,
    average_rating: gym.average_rating ? parseFloat(gym.average_rating) : null,
    review_count: parseInt(gym.review_count),
  }));
};

const getGymById = async (id) => {
  const result = await pool.query(
    `
    SELECT g.*, 
           COUNT(r.id) as review_count,
           ROUND(AVG(r.rating), 1) as average_rating
    FROM gyms g
    LEFT JOIN reviews r ON g.id = r.gym_id
    WHERE g.id = $1
    GROUP BY g.id
  `,
    [id],
  );

  if (result.rows[0]) {
    return {
      ...result.rows[0],
      average_rating: result.rows[0].average_rating
        ? parseFloat(result.rows[0].average_rating)
        : null,
      review_count: parseInt(result.rows[0].review_count),
    };
  }
  return null;
};

const createGym = async (gymData, userId) => {
  const { name, location, description } = gymData;
  const result = await pool.query(
    `INSERT INTO gyms (name, location, created_by) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [name, location || null, userId],
  );
  return result.rows[0];
};

const getReviewsByGymId = async (gymId) => {
  const result = await pool.query(
    `
    SELECT r.*, u.display_name
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.uid
    WHERE r.gym_id = $1
    ORDER BY r.created_at DESC
  `,
    [gymId],
  );
  return result.rows;
};

const createReview = async (gymId, reviewData, userId) => {
  const { rating, comment } = reviewData;
  const result = await pool.query(
    `INSERT INTO reviews (gym_id, user_id, rating, comment) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [gymId, userId, rating, comment || null],
  );
  return result.rows[0];
};

const hasUserReviewed = async (gymId, userId) => {
  const result = await pool.query(
    "SELECT id FROM reviews WHERE gym_id = $1 AND user_id = $2",
    [gymId, userId],
  );
  return result.rows.length > 0;
};

const getUserProfile = async (uid) => {
  const result = await pool.query(
    `SELECT uid, email, display_name, created_at 
     FROM users 
     WHERE uid = $1`,
    [uid],
  );
  return result.rows[0];
};

const getUserGyms = async (uid) => {
  const result = await pool.query(
    `SELECT g.*, 
            COUNT(r.id) as review_count,
            ROUND(AVG(r.rating), 1) as average_rating
     FROM gyms g
     LEFT JOIN reviews r ON g.id = r.gym_id
     WHERE g.created_by = $1
     GROUP BY g.id
     ORDER BY g.created_at DESC`,
    [uid],
  );
  return result.rows;
};

const getUserReviews = async (uid) => {
  const result = await pool.query(
    `SELECT r.*, g.name as gym_name
     FROM reviews r
     JOIN gyms g ON r.gym_id = g.id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [uid],
  );
  return result.rows;
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
