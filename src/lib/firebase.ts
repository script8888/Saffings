import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

// Web config is public by design; access control lives in Firestore rules.
const firebaseConfig = {
  apiKey: "AIzaSyAL0frte43KpXFgCpVeTCl_UCHs_S1Bc5U",
  authDomain: "vest-48f4b.firebaseapp.com",
  projectId: "vest-48f4b",
  storageBucket: "vest-48f4b.firebasestorage.app",
  messagingSenderId: "1002347263718",
  appId: "1:1002347263718:web:0033608c22ae682346ed27",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// The on-device cache keeps the app usable with no signal, as it was on
// localStorage. Writes made offline sync once the phone reconnects.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
