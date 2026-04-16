import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { AuthProvider } from "./src/hooks/useAuth";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { initSentry } from "./src/instrument/sentry";

initSentry();

function AppRoot(): React.JSX.Element {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default process.env.EXPO_PUBLIC_SENTRY_DSN?.trim()
  ? Sentry.wrap(AppRoot)
  : AppRoot;
