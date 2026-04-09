import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { RecommendationHistory } from "../types";

export async function saveRecommendationHistory(params: {
  uid: string;
  wardrobeItemId: string;
  imageUrl: string;
  recommendation: string;
  desiredStyle?: string;
  occasion?: string;
  weather?: string;
  budget?: string;
}): Promise<string> {
  const colRef = collection(db, "users", params.uid, "recommendationHistory");
  const docRef = await addDoc(colRef, {
    wardrobeItemId: params.wardrobeItemId,
    imageUrl: params.imageUrl,
    recommendation: params.recommendation,
    desiredStyle: params.desiredStyle ?? "",
    occasion: params.occasion ?? "",
    weather: params.weather ?? "",
    budget: params.budget ?? "",
    feedback: "",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateRecommendationFeedback(params: {
  uid: string;
  historyId: string;
  feedback: "like" | "dislike";
}): Promise<void> {
  const historyRef = doc(db, "users", params.uid, "recommendationHistory", params.historyId);
  await updateDoc(historyRef, { feedback: params.feedback });
}

export async function getRecommendationHistory(uid: string): Promise<RecommendationHistory[]> {
  const colRef = collection(db, "users", uid, "recommendationHistory");
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<RecommendationHistory, "id">),
  }));
}
