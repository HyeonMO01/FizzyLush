import { ShoppingProduct } from "../types";

const NAVER_SHOPPING_URL = "https://openapi.naver.com/v1/search/shop.json";

interface NaverShoppingResponse {
  items?: Array<{
    title: string;
    link: string;
    image: string;
    lprice: string;
    mallName: string;
  }>;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

export async function searchNaverShoppingProduct(query: string): Promise<ShoppingProduct | null> {
  const clientId = process.env.EXPO_PUBLIC_NAVER_SHOPPING_CLIENT_ID;
  const clientSecret = process.env.EXPO_PUBLIC_NAVER_SHOPPING_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const response = await fetch(`${NAVER_SHOPPING_URL}?query=${encodeURIComponent(query)}&display=5&sort=sim`, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as NaverShoppingResponse;
  const first = data.items?.[0];
  if (!first) {
    return null;
  }

  return {
    title: stripHtml(first.title),
    image: first.image,
    lprice: first.lprice,
    mallName: first.mallName,
    productLink: first.link,
  };
}
