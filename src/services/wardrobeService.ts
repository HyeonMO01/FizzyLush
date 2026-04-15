import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "./firebase";
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

export async function deleteWardrobeItem(uid: string, itemId: string, imageUrl?: string): Promise<void> {
  const docRef = doc(db, "users", uid, "wardrobe", itemId);
  await deleteDoc(docRef);
  if (imageUrl) {
    try {
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);
    } catch {
      // Storage 이미지 삭제 실패는 무시 (이미 없을 수 있음)
    }
  }
}

export async function updateWardrobeItem(
  uid: string,
  itemId: string,
  data: Partial<Pick<WardrobeItem, "category" | "aiSummary">>,
): Promise<void> {
  const docRef = doc(db, "users", uid, "wardrobe", itemId);
  await updateDoc(docRef, data);
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
