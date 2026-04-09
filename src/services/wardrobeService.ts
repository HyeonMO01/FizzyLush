import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { WardrobeItem } from "../types";

export async function addWardrobeItem(params: {
  uid: string;
  imageUrl: string;
  category?: string;
  aiSummary?: string;
}): Promise<string> {
  const colRef = collection(db, "users", params.uid, "wardrobe");
  const docRef = await addDoc(colRef, {
    imageUrl: params.imageUrl,
    category: params.category ?? "기타",
    aiSummary: params.aiSummary ?? "",
    uploadedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getWardrobeList(uid: string): Promise<WardrobeItem[]> {
  const colRef = collection(db, "users", uid, "wardrobe");
  const q = query(colRef, orderBy("uploadedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((docItem) => ({
    id: docItem.id,
    ...(docItem.data() as Omit<WardrobeItem, "id">),
  }));
}
