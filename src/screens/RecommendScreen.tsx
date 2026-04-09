import React, { useMemo, useState } from "react";
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { getUserProfile } from "../services/userProfileService";
import { requestVisionRecommendation } from "../services/openai";
import { saveRecommendationHistory } from "../services/recommendationService";
import { colors, spacing } from "../theme";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { VisionRecommendationResult } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Recommend">;

export function RecommendScreen({ route }: Props): React.JSX.Element {
  const { user } = useAuth();
  const { imageUrl, wardrobeItemId } = route.params;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisionRecommendationResult | null>(null);

  const hasResult = useMemo(() => Boolean(result), [result]);

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
      }`;
      const recommendationResult = await requestVisionRecommendation({ imageUrl, profileText });
      setResult(recommendationResult);
      await saveRecommendationHistory({
        uid: user.uid,
        wardrobeItemId,
        imageUrl,
        recommendation: JSON.stringify(recommendationResult),
      });
    } catch (e) {
      Alert.alert("오류", e instanceof Error ? e.message : "추천 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <Button title="AI 추천 받기" onPress={onRecommend} loading={loading} />
      {hasResult ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>추천 결과</Text>
          <Text style={styles.resultText}>{result?.summary}</Text>
          <Text style={styles.tip}>스타일링 팁: {result?.styleTip}</Text>
          <View style={styles.itemList}>
            {result?.items?.map((item, idx) => (
              <View key={`${item.category}-${idx}`} style={styles.itemCard}>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
                <View style={styles.shopButtons}>
                  <Button title="네이버쇼핑" onPress={() => openShoppingLink("naver", item.searchKeyword)} variant="ghost" />
                  <Button title="쿠팡" onPress={() => openShoppingLink("coupang", item.searchKeyword)} variant="ghost" />
                  <Button title="무신사" onPress={() => openShoppingLink("musinsa", item.searchKeyword)} variant="ghost" />
                </View>
              </View>
            ))}
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
  image: {
    width: "100%",
    height: 320,
    borderRadius: 12,
  },
  resultBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  resultText: {
    color: colors.text,
    lineHeight: 22,
  },
  tip: {
    color: colors.subText,
    lineHeight: 20,
    marginTop: 2,
  },
  itemList: {
    gap: spacing.sm,
  },
  itemCard: {
    backgroundColor: "#FFF8FB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: 6,
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
    fontSize: 13,
    lineHeight: 19,
  },
  shopButtons: {
    gap: 8,
    marginTop: 4,
  },
});
