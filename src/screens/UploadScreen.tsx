import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../navigation/MainTabNavigator";
import { colors, spacing } from "../theme";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { uploadWardrobeImage } from "../services/storageService";
import { addWardrobeItem } from "../services/wardrobeService";
import { LoadingOverlay } from "../components/LoadingOverlay";

type Props = BottomTabScreenProps<MainTabParamList, "Upload">;

export function UploadScreen({ navigation }: Props): React.JSX.Element {
  const { user } = useAuth();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (type: "camera" | "library") => {
    const permission =
      type === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("권한 필요", "이미지 접근 권한을 허용해주세요.");
      return;
    }

    const result =
      type === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onUpload = async () => {
    if (!user) {
      Alert.alert("오류", "로그인이 필요합니다.");
      return;
    }
    if (!imageUri) {
      Alert.alert("안내", "먼저 사진을 선택해주세요.");
      return;
    }
    setLoading(true);
    try {
      const imageUrl = await uploadWardrobeImage(user.uid, imageUri);
      await addWardrobeItem({ uid: user.uid, imageUrl, category: "기타", aiSummary: "" });
      Alert.alert("완료", "업로드가 완료되었습니다.");
      setImageUri(null);
      navigation.navigate("Home");
    } catch (e) {
      Alert.alert("오류", e instanceof Error ? e.message : "업로드에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>옷 사진 업로드</Text>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>선택된 이미지가 없습니다.</Text>
        </View>
      )}
      <Button title="카메라로 촬영" onPress={() => pickImage("camera")} />
      <Button title="갤러리에서 선택" onPress={() => pickImage("library")} variant="ghost" />
      <Button title="업로드 완료" onPress={onUpload} loading={loading} />
      <LoadingOverlay visible={loading} message="업로드 중..." />
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
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  preview: {
    width: "100%",
    height: 300,
    borderRadius: 12,
  },
  placeholder: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  placeholderText: {
    color: colors.subText,
  },
});
