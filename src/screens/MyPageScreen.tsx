import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, spacing } from "../theme";
import { useAuth } from "../hooks/useAuth";
import { UserProfile } from "../types";
import { getUserProfile } from "../services/userProfileService";
import { Button } from "../components/Button";

export function MyPageScreen(): React.JSX.Element {
  const { user, logoutUser } = useAuth();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);
    };
    load();
  }, [user]);

  const onLogout = async () => {
    await logoutUser();
    rootNavigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>마이페이지</Text>
      <View style={styles.card}>
        <Text style={styles.item}>닉네임: {profile?.nickname ?? "-"}</Text>
        <Text style={styles.item}>키: {profile?.height ?? "-"} cm</Text>
        <Text style={styles.item}>몸무게: {profile?.weight ?? "-"} kg</Text>
        <Text style={styles.item}>체형: {profile?.bodyType ?? "-"}</Text>
        <Text style={styles.item}>선호 스타일: {profile?.preferredStyle || "-"}</Text>
      </View>
      <Button title="온보딩 정보 수정" onPress={() => rootNavigation.navigate("Onboarding", { isEdit: true })} />
      <Button title="추천 히스토리 보기" onPress={() => rootNavigation.navigate("RecommendationHistory")} />
      <Button title="로그아웃" onPress={onLogout} variant="ghost" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  item: {
    color: colors.text,
    fontSize: 15,
  },
});
