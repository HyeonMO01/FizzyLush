export type BodyType = "슬림" | "보통" | "통통";

export interface UserProfile {
  email: string;
  nickname: string;
  height?: number;
  weight?: number;
  bodyType?: BodyType;
  preferredStyle?: string;
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

export type RecommendationFeedback = "like" | "dislike";
export type RecommendationPayload = string;

export interface RecommendationHistory {
  id: string;
  wardrobeItemId: string;
  imageUrl: string;
  recommendation: RecommendationPayload;
  desiredStyle?: string;
  occasion?: string;
  weather?: string;
  budget?: string;
  feedback?: RecommendationFeedback;
  createdAt?: unknown;
}

export interface RecommendedProductItem {
  category: string;
  title: string;
  description: string;
  searchKeyword: string;
  colorInfo?: string;
  materialInfo?: string;
  matchReason?: string;
  priceRange?: string;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  harmony: string;
}

export interface VisionRecommendationResult {
  summary: string;
  styleTip: string;
  overallMood: string;
  colorPalette: ColorPalette;
  coordinationReason: string;
  items: RecommendedProductItem[];
}

export interface GarmentBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedGarmentItem {
  category: string;
  position: string;
  color: string;
  style: string;
  boundingBox: GarmentBoundingBox;
}

export interface GarmentDetectionResult {
  items: DetectedGarmentItem[];
}

export interface ShoppingProduct {
  title: string;
  image: string;
  lprice: string;
  mallName: string;
  productLink: string;
}

export interface TryOnItemParam {
  category: string;
  title: string;
  description: string;
  searchKeyword: string;
}
