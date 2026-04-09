import React, { useMemo, useState } from "react";
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { getUserProfile } from "../services/userProfileService";
import { requestVisionRecommendation } from "../services/openai";
import { saveRecommendationHistory } from "../services/recommendationService";
import { searchNaverShoppingProduct } from "../services/naverShoppingService";
import { colors, spacing } from "../theme";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { ShoppingProduct, VisionRecommendationResult } from "../types";
import { TextField } from "../components/TextField";

type Props = NativeStackScreenProps<RootStackParamList, "Recommend">;

export function RecommendScreen({ route }: Props): React.JSX.Element {
  const { user } = useAuth();
  const { imageUrl, wardrobeItemId } = route.params;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisionRecommendationResult | null>(null);
  const [desiredStyle, setDesiredStyle] = useState("");
  const [occasion, setOccasion] = useState("데일리");
  const [weather, setWeather] = useState("선선함");
  const [budget, setBudget] = useState("");
  const [historyId, setHistoryId] = useState("");
  const [productMap, setProductMap] = useState<Record<string, ShoppingProduct | null>>({});

  const hasResult = useMemo(() => Boolean(result), [result]);
  const lineColors = ["#60A5FA", "#F59E0B", "#F472B6", "#34D399", "#A78BFA"];
  const styleOptions = ["미니멀", "스트릿", "캐주얼", "포멀", "러블리", "오피스"];
  const occasionOptions = ["데일리", "출근", "데이트", "여행", "하객"];
  const weatherOptions = ["추움", "선선함", "더움", "비오는 날"];

  const openShoppingLink = async (mall: "naver" | "coupang" | "musinsa", keyword: string) => {
    const encoded = encodeURIComponent(keyword);
    const url =
      mall === "naver"
        ? `https://search.shopping.naver.com/search/all?query=${encoded}`
        : mall === "coupang"
          ? `https://www.coupang.com/np/search?q=${encoded}`
          : `https://www.musinsa.com/search/musinsa/integration?q=${encoded}`;
    await Linking.openURL(url);
  };

  const onRecommend = async () => {
    if (!user) {
      Alert.alert("오류", "로그인이 필요합니다.");
      return;
    }
    setLoading(true);
    try {
      const profile = await getUserProfile(user.uid);
      const profileText = `키 ${profile?.height ?? "-"}cm, 몸무게 ${profile?.weight ?? "-"}kg, 체형 ${
        profile?.bodyType ?? "미입력"
      }, 선호 스타일 ${profile?.preferredStyle || "미입력"}`;
      const recommendationResult = await requestVisionRecommendation({
        imageUrl,
        profileText,
        desiredStyle,
        occasion,
        weather,
        budget,
      });
      setResult(recommendationResult);
      const products = await Promise.all(
        recommendationResult.items.map((item) => searchNaverShoppingProduct(item.searchKeyword)),
      );
      const nextMap: Record<string, ShoppingProduct | null> = {};
      products.forEach((product, idx) => {
        nextMap[String(idx)] = product;
      });
      setProductMap(nextMap);
      const savedHistoryId = await saveRecommendationHistory({
        uid: user.uid,
        wardrobeItemId,
        imageUrl,
        recommendation: JSON.stringify(recommendationResult),
        desiredStyle,
        occasion,
        weather,
        budget,
      });
      setHistoryId(savedHistoryId);
    } catch (e) {
      Alert.alert("오류", e instanceof Error ? e.message : "추천 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>AI 스타일 추천</Text>
        <Text style={styles.headerSub}>업로드한 옷에 맞는 코디와 쇼핑 링크를 추천해요.</Text>
      </View>
      <TextField
        label="오늘 원하는 스타일"
        value={desiredStyle}
        onChangeText={setDesiredStyle}
        placeholder="예: 소개팅룩, 출근룩, 힙한 스트릿"
      />
      <TextField
        label="예산 (선택)"
        value={budget}
        onChangeText={setBudget}
        placeholder="예: 10만원 이하, 상의 5만원 이하"
      />
      <View style={styles.styleChipRow}>
        {styleOptions.map((style) => (
          <Pressable
            key={style}
            style={[styles.styleChip, desiredStyle === style && styles.styleChipActive]}
            onPress={() => setDesiredStyle(style)}
          >
            <Text
              style={[styles.styleChipText, desiredStyle === style && styles.styleChipTextActive]}
            >
              {style}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>상황</Text>
        <View style={styles.styleChipRow}>
          {occasionOptions.map((item) => (
            <Pressable
              key={item}
              style={[styles.styleChip, occasion === item && styles.styleChipActive]}
              onPress={() => setOccasion(item)}
            >
              <Text style={[styles.styleChipText, occasion === item && styles.styleChipTextActive]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>날씨</Text>
        <View style={styles.styleChipRow}>
          {weatherOptions.map((item) => (
            <Pressable
              key={item}
              style={[styles.styleChip, weather === item && styles.styleChipActive]}
              onPress={() => setWeather(item)}
            >
              <Text style={[styles.styleChipText, weather === item && styles.styleChipTextActive]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Button title="AI 추천 받기" onPress={onRecommend} loading={loading} />

      {hasResult ? (
        <View style={styles.resultBoard}>
          <View style={styles.closetPanel}>
            <Text style={styles.panelTitle}>MY CLOSET</Text>
            <Image source={{ uri: imageUrl }} style={styles.closetImage} />
            <Text style={styles.summaryTitle}>전체 코디 요약</Text>
            <Text style={styles.resultText}>{result?.summary}</Text>
            <Text style={styles.tip}>팁: {result?.styleTip}</Text>
          </View>

          <View style={styles.recommendPanel}>
            <Text style={styles.panelTitle}>AI RECOMMENDATIONS</Text>
            <View style={styles.itemList}>
              {result?.items?.map((item, idx) => (
                <View key={`${item.category}-${idx}`} style={styles.itemCard}>
                  <View style={styles.linkRow}>
                    <View style={[styles.linkDot, { backgroundColor: lineColors[idx % lineColors.length] }]} />
                    <View style={[styles.linkLine, { backgroundColor: lineColors[idx % lineColors.length] }]} />
                    <Text style={styles.linkLabel}>내 옷장에서 매칭됨</Text>
                  </View>
                  <View style={styles.itemTopRow}>
                    {productMap[String(idx)]?.image ? (
                      <Image source={{ uri: productMap[String(idx)]?.image }} style={styles.productImage} />
                    ) : (
                      <View style={styles.thumb}>
                        <Text style={styles.thumbText}>상품</Text>
                        <Text style={styles.thumbSub}>썸네일</Text>
                      </View>
                    )}
                    <View style={styles.itemTextWrap}>
                      <Text style={styles.itemCategory}>{item.category}</Text>
                      <Text style={styles.itemTitle}>
                        {productMap[String(idx)]?.title || item.title}
                      </Text>
                      <Text style={styles.itemDesc}>{item.description}</Text>
                      {productMap[String(idx)]?.lprice ? (
                        <Text style={styles.priceText}>
                          최저가 {Number(productMap[String(idx)]?.lprice || 0).toLocaleString()}원 ·{" "}
                          {productMap[String(idx)]?.mallName}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.shopButtonsRow}>
                    <Pressable
                      style={styles.mallButton}
                      onPress={async () => {
                        const link = productMap[String(idx)]?.productLink;
                        if (link) {
                          await Linking.openURL(link);
                          return;
                        }
                        await openShoppingLink("naver", item.searchKeyword);
                      }}
                    >
                      <Text style={styles.mallButtonText}>
                        {productMap[String(idx)]?.productLink ? "네이버 상품" : "네이버쇼핑"}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.mallButton}
                      onPress={() => openShoppingLink("coupang", item.searchKeyword)}
                    >
                      <Text style={styles.mallButtonText}>쿠팡</Text>
                    </Pressable>
                    <Pressable
                      style={styles.buyButton}
                      onPress={() => openShoppingLink("musinsa", item.searchKeyword)}
                    >
                      <Text style={styles.buyButtonText}>바로 구매</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Image source={{ uri: imageUrl }} style={styles.previewImage} />
          <Text style={styles.emptyTitle}>추천 대기 중</Text>
          <Text style={styles.emptyDesc}>AI 추천 받기 버튼을 누르면 매칭 결과와 쇼핑 링크가 표시됩니다.</Text>
        </View>
      )}

      {hasResult && historyId ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>이 추천이 마음에 드셨나요?</Text>
          <View style={styles.feedbackRow}>
            <Pressable
              style={styles.feedbackButton}
              onPress={async () => {
                if (!user) return;
                const { updateRecommendationFeedback } = await import("../services/recommendationService");
                await updateRecommendationFeedback({ uid: user.uid, historyId, feedback: "like" });
                Alert.alert("고마워요!", "선호 데이터를 반영해서 다음 추천을 더 정확하게 만들게요.");
              }}
            >
              <Text style={styles.feedbackButtonText}>👍 좋아요</Text>
            </Pressable>
            <Pressable
              style={styles.feedbackButton}
              onPress={async () => {
                if (!user) return;
                const { updateRecommendationFeedback } = await import("../services/recommendationService");
                await updateRecommendationFeedback({ uid: user.uid, historyId, feedback: "dislike" });
                Alert.alert("확인했어요", "다음 추천에서 다른 스타일로 조정해볼게요.");
              }}
            >
              <Text style={styles.feedbackButtonText}>👎 별로예요</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <LoadingOverlay visible={loading} message="AI 분석 중..." />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  headerSub: {
    color: colors.subText,
    fontSize: 13,
  },
  styleChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  styleChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  styleChipActive: {
    borderColor: colors.primary,
    backgroundColor: "#FFEAF1",
  },
  styleChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  styleChipTextActive: {
    color: colors.primary,
  },
  filterSection: {
    gap: 6,
  },
  filterLabel: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  resultBoard: {
    backgroundColor: "#EAF0FA",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7E0F0",
    padding: spacing.sm,
    gap: spacing.sm,
  },
  closetPanel: {
    backgroundColor: "#F5F8FF",
    borderRadius: 12,
    padding: spacing.sm,
    gap: 8,
  },
  recommendPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  closetImage: {
    width: "100%",
    height: 190,
    borderRadius: 12,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  resultText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  tip: {
    color: colors.subText,
    lineHeight: 18,
    fontSize: 12,
  },
  itemList: {
    gap: spacing.sm,
  },
  itemCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: 6,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  linkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  linkLine: {
    width: 26,
    height: 2,
    borderRadius: 1,
  },
  linkLabel: {
    fontSize: 11,
    color: colors.subText,
    fontWeight: "600",
  },
  itemTopRow: {
    flexDirection: "row",
    gap: 10,
  },
  thumb: {
    width: 62,
    height: 62,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  thumbText: {
    fontWeight: "700",
    color: "#374151",
    fontSize: 11,
  },
  thumbSub: {
    fontWeight: "600",
    color: "#6B7280",
    fontSize: 10,
  },
  itemTextWrap: {
    flex: 1,
    gap: 2,
  },
  productImage: {
    width: 62,
    height: 62,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  itemCategory: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  itemTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  itemDesc: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
  },
  priceText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  shopButtonsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  mallButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  mallButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  buyButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    gap: 8,
  },
  previewImage: {
    width: "100%",
    height: 260,
    borderRadius: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  emptyDesc: {
    color: colors.subText,
    textAlign: "center",
    fontSize: 13,
  },
  feedbackCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    gap: 10,
  },
  feedbackTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  feedbackRow: {
    flexDirection: "row",
    gap: 10,
  },
  feedbackButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: "center",
  },
  feedbackButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
});
