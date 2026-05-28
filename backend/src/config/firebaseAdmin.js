const admin = require("firebase-admin");

if (!admin.apps.length) {
  const credential = process.env.FIREBASE_PRIVATE_KEY
    ? admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      })
    : admin.credential.cert(require("../../serviceAccountKey.json"));

  admin.initializeApp({ credential });
}

module.exports = admin;
