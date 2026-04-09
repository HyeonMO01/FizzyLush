import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function saveRecommendationHistory(params: {
  uid: string;
  wardrobeItemId: string;
  imageUrl: string;
  recommendation: string;
}): Promise<void> {
  const colRef = collection(db, "users", params.uid, "recommendationHistory");
  await addDoc(colRef, {
    wardrobeItemId: params.wardrobeItemId,
    imageUrl: params.imageUrl,
    recommendation: params.recommendation,
    createdAt: serverTimestamp(),
  });
}
