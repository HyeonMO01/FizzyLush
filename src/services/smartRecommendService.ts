import { proxyPost } from "./apiProxy";
import { getRecommendationHistory } from "./recommendationService";
import { getUserProfile } from "./userProfileService";
import { WardrobeItem } from "../types";

export interface DailyOutfitSuggestion {
  title: string;
  description: string;
  items: Array<{ category: string; wardrobeItemId?: string; suggestion: string; color?: string }>;
  mood: string;
  reason: string;
}

export async function generateDailySuggestions(params: {
  uid: string;
  wardrobeItems: WardrobeItem[];
  weatherDesc?: string;
  temperature?: number;
}): Promise<DailyOutfitSuggestion[]> {
  const { uid, wardrobeItems, weatherDesc, temperature } = params;

  const profile = await getUserProfile(uid);
  const style = profile?.preferredStyle || "캐주얼";
  const bodyInfo = profile
    ? `키 ${profile.height ?? "-"}cm, 몸무게 ${profile.weight ?? "-"}kg, 체형 ${profile.bodyType ?? "보통"}`
    : "정보 없음";

  const history = await getRecommendationHistory(uid);
  const recentFeedback = history
    .filter((h) => h.feedback)
    .slice(0, 5)
    .map((h) => `${h.occasion || "일상"}: ${h.feedback === "like" ? "좋아함" : "별로"}`)
    .join(", ");

  const wardrobeDesc = wardrobeItems
    .slice(0, 30)
    .map((i, idx) => `[${idx + 1}] ${i.category}${i.aiSummary ? ` - ${i.aiSummary}` : ""}`)
    .join("\n");

  const month = new Date().getMonth() + 1;
  const season = month <= 2 || month === 12 ? "겨울" : month <= 5 ? "봄" : month <= 8 ? "여름" : "가을";
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = dayNames[new Date().getDay()];

  const weatherInfo = temperature !== undefined
    ? `현재 날씨: ${weatherDesc || "맑음"}, 기온 ${temperature}°C`
    : `현재 계절: ${season}`;

  const data = await proxyPost<{
    choices?: Array<{ message?: { content?: string } }>;
  }>("/api/openai/chat-completions", {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `당신은 사용자의 옷장을 잘 아는 전문 패션 스타일리스트입니다.
사용자가 실제 보유한 옷 목록을 기반으로, 오늘 입기 좋은 코디를 추천합니다.
보유하지 않은 옷은 절대 추천하지 마세요. 실제 옷장 아이템만 활용하세요.`,
      },
      {
        role: "user",
        content: `오늘(${dayOfWeek}요일)의 코디 3벌을 추천해주세요.

[사용자 정보]
${bodyInfo}, 선호 스타일: ${style}

[오늘의 날씨]
${weatherInfo}

[보유 옷장]
${wardrobeDesc}

${recentFeedback ? `[최근 코디 피드백]\n${recentFeedback}` : ""}

위 옷장의 아이템만 활용해서 3가지 다른 분위기의 코디를 추천해주세요.
각 코디마다 왜 이 조합이 좋은지 이유를 설명해주세요.

JSON 배열로만 반환하세요. 마크다운 코드블록 금지:
[
  {
    "title": "코디 제목 (감성적으로, 12자 이내)",
    "description": "오늘 이 코디를 추천하는 이유 (25자 이내)",
    "items": [
      {"category": "상의", "suggestion": "옷장의 어떤 아이템인지 구체적으로", "color": "색상"},
      {"category": "하의", "suggestion": "구체적 아이템 설명", "color": "색상"}
    ],
    "mood": "분위기 키워드",
    "reason": "이 조합이 어울리는 이유 2-3문장"
  }
]`,
      },
    ],
  });

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) return [];

  try {
    let text = content;
    if (text.startsWith("```")) text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const parsed = JSON.parse(text) as DailyOutfitSuggestion[];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 3).map((s) => ({
      ...s,
      reason: s.reason || "",
    }));
  } catch {
    return [];
  }
}
