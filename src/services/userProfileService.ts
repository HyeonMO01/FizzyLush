import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { db } from "./firebase";
import { BodyType, UserProfile } from "../types";

export async function createUserProfile(params: {
  uid: string;
  email: string;
  nickname: string;
}): Promise<void> {
  try {
    const userRef = doc(db, "users", params.uid);
    await setDoc(userRef, {
      email: params.email,
      nickname: params.nickname,
      onboardingComplete: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "permission-denied") {
      throw new Error("Firestore 권한이 없습니다. 보안 규칙을 확인해주세요.");
    }
    throw error;
  }
}

export async function updateOnboardingProfile(params: {
  uid: string;
  height: number;
  weight: number;
  bodyType: BodyType;
  preferredStyle?: string;
}): Promise<void> {
  const userRef = doc(db, "users", params.uid);
  await updateDoc(userRef, {
    height: params.height,
    weight: params.weight,
    bodyType: params.bodyType,
    preferredStyle: params.preferredStyle ?? "",
    onboardingComplete: true,
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    return null;
  }
  return snap.data() as UserProfile;
}
