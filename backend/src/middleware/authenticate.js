const axios = require("axios");
const db = require("./db/queries");

const signInWithEmailPassword = async (email, password) => {
  const apiKey = process.env.FIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error("Please check your private key. Private key not found");
  }

  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email: email,
        password: password,
        returnSecureToken: true,
      },
    );

    // Get user info from Firebase
    const userRecord = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        idToken: response.data.idToken,
      },
    );

    // const firebaseUser = userRecord.data.users[0];
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
