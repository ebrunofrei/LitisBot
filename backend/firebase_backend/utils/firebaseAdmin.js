const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "../credenciales/serviceAccountKey.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "YOUR_FIREBASE_PROJECT_ID.appspot.com"  // Reemplaza con tu bucket si usas Cloud Storage
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket(); // Solo si usas almacenamiento

module.exports = { admin, db, bucket };