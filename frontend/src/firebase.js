import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Usa exactamente tus datos reales de Firebase (de la consola)
const firebaseConfig = {
  apiKey: "AIzaSyKv_ShtwwY49DASoZz7oQ3bAvofJ0M", // <-- este valor debe coincidir 100%
  authDomain: "litigator-5628c.firebaseapp.com",
  projectId: "litigator-5628c",
  storageBucket: "litigator-5628c.appspot.com",
  messagingSenderId: "626042958584",
  appId: "1:626042958584:web:41b03c4d760edbc0344cfd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
