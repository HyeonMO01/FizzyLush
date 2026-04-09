import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { colors, spacing } from "../theme";
import { useAuth } from "../hooks/useAuth";
import { BodyType, UserProfile } from "../types";
import { getUserProfile, updateOnboardingProfile } from "../services/userProfileService";
import { Button } from "../components/Button";

export function MyPageScreen(): React.JSX.Element {
  const { user, logoutUser } = useAuth();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);
    };
    load();
  }, [user]);

  const onQuickUpdate = async () => {
    if (!user || !profile?.height || !profile?.weight || !profile.bodyType) {
      Alert.alert("안내", "온보딩 정보가 없습니다.");
      return;
    }
    setLoading(true);
    try {
      const nextBodyType: BodyType =
        profile.bodyType === "슬림" ? "보통" : profile.bodyType === "보통" ? "통통" : "슬림";
      await updateOnboardingProfile({
        uid: user.uid,
        height: profile.height,
        weight: profile.weight,
        bodyType: nextBodyType,
      });
      const refreshed = await getUserProfile(user.uid);
      setProfile(refreshed);
      Alert.alert("완료", `체형이 ${nextBodyType}으로 변경되었습니다.`);
    } catch (e) {
      Alert.alert("오류", e instanceof Error ? e.message : "수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

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
      </View>
      <Button title="체형 정보 수정" onPress={onQuickUpdate} loading={loading} />
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
