import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCCYNVxHkxyy0hUVh86tNPR8VW9nb3uHME",
  authDomain: "ynebs-egeguler.firebaseapp.com",
  projectId: "ynebs-egeguler",
  storageBucket: "ynebs-egeguler.firebasestorage.app",
  messagingSenderId: "621533017694",
  appId: "1:621533017694:web:d9cf51c86aa3f192c366cf",
  measurementId: "G-RT5J52551E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };