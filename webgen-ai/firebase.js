import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; 

// Tes clés de configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAV3Iya25qN86_gsh-o1eLao3JkXqmpmIs",
  authDomain: "webgen-app.firebaseapp.com",
  projectId: "webgen-app",
  storageBucket: "webgen-app.firebasestorage.app",
  messagingSenderId: "782685715226",
  appId: "1:782685715226:web:2339b3d549bc1da80b8aa3",
  measurementId: "G-ZZB36TQ5GX"
};

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);

// On exporte la base de données, l'auth et le fournisseur Google
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();