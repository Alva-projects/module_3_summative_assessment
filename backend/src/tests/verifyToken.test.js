jest.mock("../config/firebaseAdmin", () => {
  const mockAuth = { verifyIdToken: jest.fn() };
  return { auth: () => mockAuth };
});

const admin = require("../config/firebaseAdmin");
const verifyToken = require("../middleware/verifyToken");

describe("verifyToken middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("returnerar 401 om ingen token skickas", async () => {
    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
    expect(next).not.toHaveBeenCalled();
  });

  it("anropar next() och sätter req.user om token är giltig", async () => {
    req.headers.authorization = "Bearer giltig-token";
    admin.auth().verifyIdToken.mockResolvedValue({ uid: "user-123", email: "test@test.com" });

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ uid: "user-123", email: "test@test.com" });
  });

  it("returnerar 401 om token är ogiltig", async () => {
    req.headers.authorization = "Bearer ogiltig-token";
    admin.auth().verifyIdToken.mockRejectedValue(new Error("Token expired"));

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });
});