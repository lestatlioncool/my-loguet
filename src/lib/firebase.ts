// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAD5XWoFm-yitBnfvMe7DuAJp-VTT4_6M8",
  authDomain: "loguet-12e82.firebaseapp.com",
  projectId: "loguet-12e82",
  storageBucket: "loguet-12e82.firebasestorage.app",
  messagingSenderId: "877478966530",
  appId: "1:877478966530:web:e415ea503f8bc2f761fe1b",
  measurementId: "G-HKQ6KFQ2GG"
};

// 2重起動防止
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// データベースとストレージを有効化
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };