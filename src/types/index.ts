export type BodyType = "슬림" | "보통" | "통통";

export interface UserProfile {
  email: string;
  nickname: string;
  height?: number;
  weight?: number;
  bodyType?: BodyType;
  onboardingComplete: boolean;
  createdAt?: unknown;
}

export interface WardrobeItem {
  id: string;
  imageUrl: string;
  category: string;
  uploadedAt?: unknown;
  aiSummary: string;
}

export interface RecommendationHistory {
  id: string;
  wardrobeItemId: string;
  imageUrl: string;
  recommendation: string;
  createdAt?: unknown;
}

export interface RecommendedProductItem {
  category: "상의" | "하의" | "아우터" | "신발" | "액세서리";
  title: string;
  description: string;
  searchKeyword: string;
}

export interface VisionRecommendationResult {
  summary: string;
  styleTip: string;
  items: RecommendedProductItem[];
}
