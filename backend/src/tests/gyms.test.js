const request = require("supertest");

jest.mock("../config/firebaseAdmin", () => ({
  auth: () => ({ verifyIdToken: jest.fn() }),
}));

jest.mock("../middleware/verifyToken", () => (req, res, next) => {
  req.user = { uid: "test-uid", email: "test@test.com" };
  next();
});

jest.mock("../db/queries");

const app = require("../app");
const db = require("../db/queries");

const VALID_ID = "507f1f77bcf86cd799439011";
const INVALID_ID = "inte-ett-id";

beforeEach(() => {
  jest.clearAllMocks();
});


describe("GET /gyms", () => {
  it("returnerar en lista med gym", async () => {
    db.getAllGyms.mockResolvedValue([
      { id: VALID_ID, name: "Test Gym", location: "Stockholm", review_count: 0 },
    ]);

    const res = await request(app).get("/gyms");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Test Gym");
  });

  it("returnerar 500 om databasen kraschar", async () => {
    db.getAllGyms.mockRejectedValue(new Error("DB-fel"));

    const res = await request(app).get("/gyms");

    expect(res.status).toBe(500);
  });
});


describe("GET /gyms/:id", () => {
  it("returnerar gym med recensioner för ett giltigt id", async () => {
    db.getGymById.mockResolvedValue({ id: VALID_ID, name: "Test Gym", location: "Stockholm" });
    db.getReviewsByGymId.mockResolvedValue([]);

    const res = await request(app).get(`/gyms/${VALID_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.gym.name).toBe("Test Gym");
    expect(res.body.reviews).toEqual([]);
  });

  it("returnerar 400 för ett ogiltigt id", async () => {
    const res = await request(app).get(`/gyms/${INVALID_ID}`);

    expect(res.status).toBe(400);
  });

  it("returnerar 404 om gymmet inte finns", async () => {
    db.getGymById.mockResolvedValue(null);

    const res = await request(app).get(`/gyms/${VALID_ID}`);

    expect(res.status).toBe(404);
  });
});


describe("POST /gyms", () => {
  it("skapar ett gym och returnerar 201", async () => {
    db.createGym.mockResolvedValue({ id: VALID_ID, name: "Nytt Gym", location: "Göteborg" });

    const res = await request(app)
      .post("/gyms")
      .set("Authorization", "Bearer mock-token")
      .send({ name: "Nytt Gym", location: "Göteborg" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Nytt Gym");
  });

  it("returnerar 400 om namn saknas", async () => {
    const res = await request(app)
      .post("/gyms")
      .set("Authorization", "Bearer mock-token")
      .send({ location: "Göteborg" });

    expect(res.status).toBe(400);
  });

  it("returnerar 400 om plats saknas", async () => {
    const res = await request(app)
      .post("/gyms")
      .set("Authorization", "Bearer mock-token")
      .send({ name: "Nytt Gym" });

    expect(res.status).toBe(400);
  });
});


describe("POST /gyms/:id/reviews", () => {
  it("skapar en recension och returnerar 201", async () => {
    db.getGymById.mockResolvedValue({ id: VALID_ID, name: "Test Gym" });
    db.hasUserReviewed.mockResolvedValue(false);
    db.createReview.mockResolvedValue({ _id: "review-id", rating: 4, comment: "Toppen!" });

    const res = await request(app)
      .post(`/gyms/${VALID_ID}/reviews`)
      .set("Authorization", "Bearer mock-token")
      .send({ rating: 4, comment: "Toppen!" });

    expect(res.status).toBe(201);
  });

  it("returnerar 400 om betyget är utanför 1–5", async () => {
    const res = await request(app)
      .post(`/gyms/${VALID_ID}/reviews`)
      .set("Authorization", "Bearer mock-token")
      .send({ rating: 6 });

    expect(res.status).toBe(400);
  });

  it("returnerar 400 om användaren redan recenserat gymmet", async () => {
    db.getGymById.mockResolvedValue({ id: VALID_ID, name: "Test Gym" });
    db.hasUserReviewed.mockResolvedValue(true);

    const res = await request(app)
      .post(`/gyms/${VALID_ID}/reviews`)
      .set("Authorization", "Bearer mock-token")
      .send({ rating: 3 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("You have already reviewed this gym");
  });

  it("returnerar 400 för ett ogiltigt gym-id", async () => {
    const res = await request(app)
      .post(`/gyms/${INVALID_ID}/reviews`)
      .set("Authorization", "Bearer mock-token")
      .send({ rating: 3 });

    expect(res.status).toBe(400);
  });
});
