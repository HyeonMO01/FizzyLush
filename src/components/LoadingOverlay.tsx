import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({
  visible,
  message = "로딩 중...",
}: LoadingOverlayProps): React.JSX.Element | null {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  box: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 10,
  },
  text: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
});
