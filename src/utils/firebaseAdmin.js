// /utils/firebaseAdmin.js
const admin = require('firebase-admin');
const path = require('path');

// RUTA CORRECTA a tu clave privada descargada desde Firebase Console
const serviceAccount = require(path.join(__dirname, '../credenciales/serviceAccountKey.json'));

// CAMBIA por tu bucket real de Firebase (coincide con tu ID de proyecto)
const storageBucket = 'litigator-5628c.appspot.com';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket, // para poder usar Firebase Storage
  });
}

const db = admin.firestore();            // Acceso a Firestore
const bucket = admin.storage().bucket(); // Acceso a Storage

module.exports = { admin, db, bucket };
