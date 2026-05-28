// Unit tests för db/queries.js
// Mongoose-modellerna mockas — ingen riktig databasanslutning behövs

jest.mock("../models/gym", () => {
  const MockGym = jest.fn().mockImplementation(function (data) {
    Object.assign(this, data);
    this._id = "507f1f77bcf86cd799439011";
    this.save = jest.fn().mockResolvedValue(this);
    this.toObject = jest.fn().mockReturnValue({ ...data, _id: this._id });
  });
  MockGym.aggregate = jest.fn();
  return MockGym;
});

jest.mock("../models/review", () => {
  const MockReview = jest.fn().mockImplementation(function (data) {
    Object.assign(this, data);
    this._id = "607f1f77bcf86cd799439022";
    this.save = jest.fn().mockResolvedValue(this);
    this.toObject = jest.fn().mockReturnValue({ ...data, _id: this._id });
  });
  MockReview.find = jest.fn();
  MockReview.findOne = jest.fn();
  return MockReview;
});

jest.mock("../models/user", () => ({
  findOneAndUpdate: jest.fn(),
}));

const db = require("../db/queries");
const Gym = require("../models/gym");
const Review = require("../models/review");
const User = require("../models/user");

const VALID_GYM_ID = "507f1f77bcf86cd799439011";

beforeEach(() => {
  jest.clearAllMocks();
});

// ── getAllGyms ────────────────────────────────────────────────────────────────

describe("getAllGyms", () => {
  it("returnerar resultat från Gym.aggregate()", async () => {
    const mockGyms = [{ id: VALID_GYM_ID, name: "Test Gym" }];
    Gym.aggregate.mockResolvedValue(mockGyms);

    const result = await db.getAllGyms();

    expect(Gym.aggregate).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockGyms);
  });
});

// ── getGymById ────────────────────────────────────────────────────────────────

describe("getGymById", () => {
  it("returnerar första gym-objektet från aggregationen", async () => {
    const mockGym = { id: VALID_GYM_ID, name: "Test Gym" };
    Gym.aggregate.mockResolvedValue([mockGym]);

    const result = await db.getGymById(VALID_GYM_ID);

    expect(result).toEqual(mockGym);
  });

  it("returnerar null om gymmet inte finns", async () => {
    Gym.aggregate.mockResolvedValue([]);

    const result = await db.getGymById(VALID_GYM_ID);

    expect(result).toBeNull();
  });
});

// ── createGym ─────────────────────────────────────────────────────────────────

describe("createGym", () => {
  it("sparar ett nytt gym och returnerar det med ett id-fält", async () => {
    const gymData = { name: "Nytt Gym", location: "Stockholm", description: "Bra gym" };

    const result = await db.createGym(gymData, "user-uid");

    expect(Gym).toHaveBeenCalledWith({ ...gymData, createdBy: "user-uid" });
    expect(result).toHaveProperty("id");
    expect(result.name).toBe("Nytt Gym");
  });
});

// ── hasUserReviewed ───────────────────────────────────────────────────────────

describe("hasUserReviewed", () => {
  it("returnerar true om användaren redan recenserat gymmet", async () => {
    Review.findOne.mockResolvedValue({ _id: "review-id" });

    const result = await db.hasUserReviewed(VALID_GYM_ID, "user-uid");

    expect(result).toBe(true);
  });

  it("returnerar false om användaren inte recenserat gymmet", async () => {
    Review.findOne.mockResolvedValue(null);

    const result = await db.hasUserReviewed(VALID_GYM_ID, "user-uid");

    expect(result).toBe(false);
  });
});

// ── getReviewsByGymId ─────────────────────────────────────────────────────────

describe("getReviewsByGymId", () => {
  it("returnerar recensioner mappade med rätt fältnamn", async () => {
    const mockReviews = [
      {
        _id: "review-id",
        gymId: VALID_GYM_ID,
        userId: "user-uid",
        userEmail: "test@test.com",
        rating: 4,
        comment: "Bra gym!",
        createdAt: new Date("2026-01-01"),
      },
    ];
    Review.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockReviews),
      }),
    });

    const result = await db.getReviewsByGymId(VALID_GYM_ID);

    expect(result[0].user_email).toBe("test@test.com");
    expect(result[0].created_at).toEqual(new Date("2026-01-01"));
    expect(result[0].id).toBe("review-id");
  });
});
