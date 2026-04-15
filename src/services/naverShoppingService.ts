import { ShoppingProduct } from "../types";
import { proxyGet } from "./apiProxy";

interface NaverShoppingResponse {
  items?: Array<{
    title: string;
    link: string;
    image: string;
    lprice: string;
    hprice: string;
    mallName: string;
    brand: string;
    category1: string;
    category2: string;
  }>;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

function parseBudgetToWon(budget?: string): number | null {
  if (!budget || budget === "제한 없음" || budget === "제한없음") return null;
  const num = budget.replace(/[^0-9]/g, "");
  if (!num) return null;
  const val = parseInt(num, 10);
  if (budget.includes("만")) return val * 10000;
  return val;
}

export async function searchNaverShoppingProducts(
  query: string,
  count = 8,
  options?: { budget?: string; sort?: "sim" | "asc" | "dsc" | "date" },
): Promise<ShoppingProduct[]> {
  try {
    const n = Math.max(1, Math.min(20, count));
    const sort = options?.sort || "sim";
    const data = await proxyGet<NaverShoppingResponse>(
      `/api/naver/shop-search?query=${encodeURIComponent(query)}&display=${n}&sort=${sort}`,
    );

    let items = (data.items ?? []).map((item) => ({
      title: stripHtml(item.title),
      image: item.image,
      lprice: item.lprice,
      mallName: item.mallName,
      productLink: item.link,
    }));

    const maxPrice = parseBudgetToWon(options?.budget);
    if (maxPrice) {
      const filtered = items.filter((item) => {
        const price = Number(item.lprice);
        return price > 0 && price <= maxPrice;
      });
      if (filtered.length >= 2) {
        items = filtered;
      }
    }

    return items;
  } catch {
    return [];
  }
}

export async function searchNaverShoppingProduct(query: string): Promise<ShoppingProduct | null> {
  try {
    const data = await proxyGet<NaverShoppingResponse>(
      `/api/naver/shop-search?query=${encodeURIComponent(query)}&display=5&sort=sim`,
    );
    const first = data.items?.[0];
    if (!first) return null;

    return {
      title: stripHtml(first.title),
      image: first.image,
      lprice: first.lprice,
      mallName: first.mallName,
      productLink: first.link,
    };
  } catch {
    return null;
  }
}
