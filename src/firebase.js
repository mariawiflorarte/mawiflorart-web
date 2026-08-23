import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsJf2Zy4G8stO6HANQNfUJLgXOLHUmYt8",
  authDomain: "mawiflorart-57c83.firebaseapp.com",
  projectId: "mawiflorart-57c83",
  storageBucket: "mawiflorart-57c83.firebasestorage.app",
  messagingSenderId: "815760123802",
  appId: "1:815760123802:web:4249fe216db7f6d2cf7c23",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Guardamos todo o estoque num único documento, igual fazíamos antes.
// Coleção "mawiflorart", documento "data".
const DATA_DOC = doc(db, "mawiflorart", "data");

export async function loadData() {
  const snap = await getDoc(DATA_DOC);
  if (snap.exists()) return snap.data();
  return null;
}

export async function saveData(data) {
  await setDoc(DATA_DOC, data);
}
