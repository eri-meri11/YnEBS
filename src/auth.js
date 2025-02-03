import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const auth = getAuth();

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, { role: "student" });
    }
  } catch (error) {
    console.error("Giriş hatası:", error);
  }
};

export const logout = async () => {
  await signOut(auth);
};

export const checkAuthState = (callback) => {
  onAuthStateChanged(auth, callback);
};
