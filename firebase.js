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
  updateDoc,
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

// ========== プレイヤー名変更 ==========

export async function changeDisplayName(newName) {
  const user = auth.currentUser;
  if (!user) return;
  await updateProfile(user, { displayName: newName });
  await setDoc(doc(db, 'users', user.uid), { name: newName }, { merge: true });
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

// ========== セーブデータ全体の同期 ==========

export async function saveGameData(gameStateJson) {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, 'users', user.uid), {
    saveData:  gameStateJson,
    updatedAt: Date.now(),
  }, { merge: true });
}

export async function loadGameData() {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists()) return null;
  return snap.data().saveData ?? null;
}

// ========== 個人補填クーポン ==========

export async function redeemPersonalCoupon(code) {
  const user = auth.currentUser;
  if (!user) return { error: 'login_required' };

  try {
    const ref  = doc(db, 'coupons', code);
    const snap = await getDoc(ref);
    if (!snap.exists())        return { error: 'invalid' };

    const data = snap.data();
    if (data.used)             return { error: 'used' };
    if (data.uid !== user.uid) return { error: 'invalid' };

    await updateDoc(ref, { used: true });
    return { reward: data.reward, amount: data.amount, desc: data.desc };
  } catch (e) {
    console.error('[coupon]', e);
    return { error: 'network' };
  }
}

// ========== ランキング取得（総獲得藻 上位20件） ==========

export async function fetchRanking() {
  const q    = query(collection(db, 'users'), orderBy('totalMoku', 'desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }));
}
