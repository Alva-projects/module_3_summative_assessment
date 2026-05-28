const request = require("supertest");

jest.mock("../config/firebaseAdmin", () => ({
  auth: () => ({ verifyIdToken: jest.fn() }),
}));

jest.mock("../db/queries");

const app = require("../app");

describe("CORS headers", () => {
  it("sätter Access-Control-Allow-Origin på vanliga requests", async () => {
    const res = await request(app).get("/gyms");
    expect(res.headers["access-control-allow-origin"]).toBeDefined();
  });

  it("svarar 200 på OPTIONS preflight", async () => {
    const res = await request(app)
      .options("/gyms")
      .set("Origin", "https://gym-reviews.vercel.app")
      .set("Access-Control-Request-Method", "POST");
    expect(res.status).toBe(200);
  });
});

describe("GET /config", () => {
  it("returnerar Firebase-konfiguration", async () => {
    process.env.FIREBASE_API_KEY = "test-api-key";
    process.env.FIREBASE_PROJECT_ID = "test-project";

    const res = await request(app).get("/config");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("firebaseApiKey");
    expect(res.body).toHaveProperty("firebaseAuthDomain");
    expect(res.body).toHaveProperty("firebaseProjectId");
  });

  it("exponerar inte känslig data via /config", async () => {
    const res = await request(app).get("/config");
    expect(res.body).not.toHaveProperty("MONGO_URI");
    expect(res.body).not.toHaveProperty("FIREBASE_PRIVATE_KEY");
    expect(res.body).not.toHaveProperty("FIREBASE_CLIENT_EMAIL");
  });
});
