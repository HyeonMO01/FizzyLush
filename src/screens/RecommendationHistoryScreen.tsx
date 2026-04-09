import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { getRecommendationHistory } from "../services/recommendationService";
import { RecommendationHistory } from "../types";
import { colors, spacing } from "../theme";

export function RecommendationHistoryScreen(): React.JSX.Element {
  const { user } = useAuth();
  const [list, setList] = useState<RecommendationHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await getRecommendationHistory(user.uid);
        setList(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <View style={styles.container}>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={async () => {
          if (!user) return;
          const data = await getRecommendationHistory(user.uid);
          setList(data);
        }}
        contentContainerStyle={styles.content}
        ListEmptyComponent={<Text style={styles.empty}>아직 추천 히스토리가 없습니다.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.textWrap}>
              <Text style={styles.meta}>스타일: {item.desiredStyle || "-"}</Text>
              <Text style={styles.meta}>상황: {item.occasion || "-"}</Text>
              <Text style={styles.meta}>날씨: {item.weather || "-"}</Text>
              <Text style={styles.meta}>예산: {item.budget || "-"}</Text>
              <Text style={styles.meta}>
                피드백: {item.feedback === "like" ? "좋아요" : item.feedback === "dislike" ? "별로" : "-"}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    flexDirection: "row",
    gap: spacing.sm,
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: 8,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  meta: {
    color: colors.text,
    fontSize: 13,
  },
  empty: {
    color: colors.subText,
    textAlign: "center",
    marginTop: 60,
  },
});
