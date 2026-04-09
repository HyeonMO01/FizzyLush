import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "ghost";
}

export function Button({
  title,
  onPress,
  loading = false,
  variant = "primary",
}: ButtonProps): React.JSX.Element {
  const ghost = variant === "ghost";
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        ghost ? styles.ghost : styles.primary,
        pressed && styles.pressed,
      ]}
      disabled={loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={ghost ? colors.primary : "#FFFFFF"} />
      ) : (
        <Text style={[styles.text, ghost ? styles.ghostText : styles.primaryText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  ghostText: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
});
