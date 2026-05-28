const db = require("../db/queries");

const signInWithEmailPassword = async (email, password) => {
  const apiKey = process.env.FIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error("Please check your private key. Private key not found");
  }

try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Authentication failed");
    }

    const userRecordResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: data.idToken,
        }),
      },
    );

    const userRecord = await userRecordResponse.json();
    const firebaseUser = userRecord.users[0];

    return {
      user: firebaseUser,
      idToken: data.idToken,
    };
  } catch (error) {
    console.error(
      "Firebase Auth Error:",
      error.response?.data?.error?.message || error.message,
    );
    throw new Error(
      error.response?.data?.error?.message || "Authentication failed",
    );
  }
};

module.exports = { signInWithEmailPassword };
