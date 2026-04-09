const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
import { VisionRecommendationResult } from "../types";

const SYSTEM_PROMPT = `당신은 전문 패션 스타일리스트이자 쇼핑 큐레이터입니다.
사용자가 업로드한 옷 사진을 분석하고 사용자 체형 정보를 고려해서,
각 카테고리별로 실제 쇼핑 검색에 바로 쓸 수 있는 추천을 한국어로 제공합니다.

반드시 아래 JSON 형식 "하나만" 반환하세요. 마크다운 코드블록 금지:
{
  "summary": "전체 코디 요약",
  "styleTip": "스타일링 팁",
  "items": [
    { "category": "상의", "title": "추천 아이템명", "description": "추천 이유", "searchKeyword": "쇼핑 검색 키워드" },
    { "category": "하의", "title": "...", "description": "...", "searchKeyword": "..." },
    { "category": "아우터", "title": "...", "description": "...", "searchKeyword": "..." },
    { "category": "신발", "title": "...", "description": "...", "searchKeyword": "..." },
    { "category": "액세서리", "title": "...", "description": "...", "searchKeyword": "..." }
  ]
}`;

export async function requestVisionRecommendation(params: {
  imageUrl: string;
  profileText: string;
}): Promise<VisionRecommendationResult> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API 키가 설정되지 않았습니다.");
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            { type: "text", text: `사용자 체형 정보: ${params.profileText}` },
            { type: "image_url", image_url: { url: params.imageUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI 요청 실패: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("추천 결과를 받지 못했습니다.");
  }
  try {
    const parsed = JSON.parse(content) as VisionRecommendationResult;
    if (!parsed.summary || !parsed.styleTip || !Array.isArray(parsed.items)) {
      throw new Error("추천 응답 형식이 올바르지 않습니다.");
    }
    return parsed;
  } catch {
    throw new Error("AI 추천 결과를 해석하지 못했습니다. 다시 시도해주세요.");
  }
}
