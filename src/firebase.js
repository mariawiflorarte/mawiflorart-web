import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

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
export const auth = getAuth(app);

// Login do painel interno (Produtos / Matéria-Prima). O catálogo público
// (/catalogo) nunca passa por aqui — continua acessível sem login.
export function loginWithPassword(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export function logout() {
  return signOut(auth);
}
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

// Estrutura nova: cada produto e cada matéria-prima é o SEU PRÓPRIO documento,
// então o limite de 1MB do Firestore passa a valer por item, não para o
// estoque inteiro somado. As categorias ficam num documento único, separado
// (são só texto, nunca vão pesar).
const PRODUCTS_COL = collection(db, "products");
const MATERIALS_COL = collection(db, "materials");
const META_DOC = doc(db, "meta", "categories");
const LEGACY_DOC = doc(db, "mawiflorart", "data"); // formato antigo, usado só para migração

export async function loadData() {
  const [productsSnap, materialsSnap, metaSnap] = await Promise.all([
    getDocs(PRODUCTS_COL),
    getDocs(MATERIALS_COL),
    getDoc(META_DOC),
  ]);

  let products = productsSnap.docs.map((d) => d.data());
  let materials = materialsSnap.docs.map((d) => d.data());
  let categories = metaSnap.exists() ? metaSnap.data().list : null;

  // Migração automática: se ainda não há nada no formato novo, mas existe
  // o documento antigo (formato único), copia tudo para o formato novo.
  if (products.length === 0 && materials.length === 0 && !categories) {
    const legacySnap = await getDoc(LEGACY_DOC);
    if (legacySnap.exists()) {
      const legacy = legacySnap.data();
      products = legacy.products || [];
      materials = legacy.materials || [];
      categories = legacy.categories || null;
      await migrateToPerItemDocs(products, materials, categories);
    }
  }

  if (products.length === 0 && materials.length === 0 && !categories) return null;
  return { products, materials, categories: categories || [] };
}

async function migrateToPerItemDocs(products, materials, categories) {
  const batch = writeBatch(db);
  products.forEach((p) => batch.set(doc(db, "products", p.id), p));
  materials.forEach((m) => batch.set(doc(db, "materials", m.id), m));
  if (categories) batch.set(META_DOC, { list: categories });
  await batch.commit();
}

// Salva o estado inteiro, mas só grava (ou apaga) no Firestore os itens que
// realmente mudaram desde a última vez — assim cada produto/matéria-prima
// continua sendo seu próprio documento pequeno.
export async function saveData(next, prev) {
  const batch = writeBatch(db);
  let hasWrites = false;

  const prevProducts = new Map((prev?.products || []).map((p) => [p.id, p]));
  const nextProducts = new Map((next.products || []).map((p) => [p.id, p]));
  for (const [id, p] of nextProducts) {
    if (JSON.stringify(prevProducts.get(id)) !== JSON.stringify(p)) {
      batch.set(doc(db, "products", id), p);
      hasWrites = true;
    }
  }
  for (const id of prevProducts.keys()) {
    if (!nextProducts.has(id)) {
      batch.delete(doc(db, "products", id));
      hasWrites = true;
    }
  }

  const prevMaterials = new Map((prev?.materials || []).map((m) => [m.id, m]));
  const nextMaterials = new Map((next.materials || []).map((m) => [m.id, m]));
  for (const [id, m] of nextMaterials) {
    if (JSON.stringify(prevMaterials.get(id)) !== JSON.stringify(m)) {
      batch.set(doc(db, "materials", id), m);
      hasWrites = true;
    }
  }
  for (const id of prevMaterials.keys()) {
    if (!nextMaterials.has(id)) {
      batch.delete(doc(db, "materials", id));
      hasWrites = true;
    }
  }

  if (JSON.stringify(prev?.categories) !== JSON.stringify(next.categories)) {
    batch.set(META_DOC, { list: next.categories });
    hasWrites = true;
  }

  if (hasWrites) await batch.commit();
}
