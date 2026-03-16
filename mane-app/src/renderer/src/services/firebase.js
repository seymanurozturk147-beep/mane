import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "mane-43474",
  appId: "1:422630604266:web:c4a74193240f2879ca8693",
  storageBucket: "mane-43474.firebasestorage.app",
  apiKey: "AIzaSyBpa-EhVOFizm-lh5DWmL-bvTK132H__6M",
  authDomain: "mane-43474.firebaseapp.com",
  messagingSenderId: "422630604266",
  measurementId: "G-1L2C55VY5M"
};

console.log("[Firebase] Başlatılıyor...");
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
