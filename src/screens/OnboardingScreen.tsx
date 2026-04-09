import React, { useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { BodyType } from "../types";
import { updateOnboardingProfile } from "../services/userProfileService";
import { colors, spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;
const BODY_TYPES: BodyType[] = ["슬림", "보통", "통통"];

export function OnboardingScreen({ navigation }: Props): React.JSX.Element {
  const { user } = useAuth();
  const weightInputRef = useRef<TextInput>(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyType, setBodyType] = useState<BodyType>("보통");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSave = async () => {
    if (!user) {
      setError("로그인 정보가 없습니다.");
      return;
    }
    if (!height || !weight) {
      setError("키와 몸무게를 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await updateOnboardingProfile({
        uid: user.uid,
        height: Number(height),
        weight: Number(weight),
        bodyType,
      });
      navigation.replace("MainTabs");
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
      <Text style={styles.title}>체형 정보를 입력해주세요</Text>
      <TextField
        label="키 (cm)"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => weightInputRef.current?.focus()}
      />
      <TextField
        label="몸무게 (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        returnKeyType="done"
        onSubmitEditing={() => Keyboard.dismiss()}
        inputRef={weightInputRef}
      />
      <Text style={styles.label}>체형 선택</Text>
      <View style={styles.row}>
        {BODY_TYPES.map((item) => (
          <Pressable
            key={item}
            style={[styles.chip, bodyType === item && styles.chipActive]}
            onPress={() => setBodyType(item)}
          >
            <Text style={[styles.chipText, bodyType === item && styles.chipTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="저장하고 시작하기" onPress={onSave} loading={loading} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.sm,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: "#FFEAF1",
  },
  chipText: {
    color: colors.text,
    fontWeight: "600",
  },
  chipTextActive: {
    color: colors.primary,
  },
  error: {
    color: colors.error,
    fontWeight: "600",
  },
});
