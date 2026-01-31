// Import des fonctions dont on a besoin
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- REMPLACE CECI PAR TA PROPRE CONFIGURATION FIREBASE ---
// Tu trouves ça dans la console Firebase > Paramètres du projet > Vos applications
const firebaseConfig = {
  apiKey: "AIzaSyAV3Iya25qN86_gsh-o1eLao3JkXqmpmIs",
  authDomain: "webgen-app.firebaseapp.com",
  projectId: "webgen-app",
  storageBucket: "webgen-app.firebasestorage.app",
  messagingSenderId: "782685715226",
  appId: "1:782685715226:web:2339b3d549bc1da80b8aa3",
  measurementId: "G-ZZB36TQ5GX"
};
// ---------------------------------------------------------

// On initialise Firebase
const app = initializeApp(firebaseConfig);
// On exporte la base de données pour l'utiliser ailleurs
export const db = getFirestore(app);