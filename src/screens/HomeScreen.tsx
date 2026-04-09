import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainTabParamList } from "../navigation/MainTabNavigator";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useAuth } from "../hooks/useAuth";
import { useWardrobeList } from "../hooks/useWardrobeList";
import { colors, spacing } from "../theme";
import { Button } from "../components/Button";
import { getUserProfile } from "../services/userProfileService";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const { user } = useAuth();
  const { items, loading, error, refetch } = useWardrobeList(user?.uid);
  const [nickname, setNickname] = useState("사용자");

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const profile = await getUserProfile(user.uid);
      setNickname(profile?.nickname ?? "사용자");
    };
    load();
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{nickname}님의 옷장</Text>
      <Button title="옷 업로드하기" onPress={() => navigation.navigate("Upload")} />
      <Text style={styles.guide}>사진을 탭하면 AI 코디 추천 화면으로 이동합니다.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        refreshing={loading}
        onRefresh={refetch}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>아직 업로드한 옷이 없습니다.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate("Recommend", {
                wardrobeItemId: item.id,
                imageUrl: item.imageUrl,
              })
            }
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          </Pressable>
        )}
      />
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
  guide: {
    color: colors.subText,
    fontSize: 13,
    marginTop: -2,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  listContent: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
  empty: {
    color: colors.subText,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  error: {
    color: colors.error,
    fontWeight: "600",
  },
});
