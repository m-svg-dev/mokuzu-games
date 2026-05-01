// ========== Firebase 初期化 ==========

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyCZmSOUjh8MrVjikT-i-6T_0oZP94UcSAo",
  authDomain:        "mokuzu-games.firebaseapp.com",
  projectId:         "mokuzu-games",
  storageBucket:     "mokuzu-games.firebasestorage.app",
  messagingSenderId: "931081387633",
  appId:             "1:931081387633:web:dda0cc0820e88bac2a65d0",
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ========== 認証 ==========

export async function registerUser(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, 'users', cred.user.uid), {
    name,
    email,
    totalMoku: 0,
    prestigeLevel: 0,
    updatedAt: Date.now(),
  });
  return cred.user;
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export function onAuthChanged(callback) {
  onAuthStateChanged(auth, callback);
}

export function currentUser() {
  return auth.currentUser;
}

// ========== スコア保存 ==========

export async function saveScore(totalMoku, prestigeLevel) {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, 'users', user.uid), {
    name:          user.displayName ?? '名無し',
    totalMoku,
    prestigeLevel,
    updatedAt:     Date.now(),
  }, { merge: true });
}

// ========== ランキング取得（総獲得藻 上位20件） ==========

export async function fetchRanking() {
  const q    = query(collection(db, 'users'), orderBy('totalMoku', 'desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }));
}
