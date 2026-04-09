import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SplashScreen } from "../screens/SplashScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { RecommendScreen } from "../screens/RecommendScreen";
import { MainTabNavigator } from "./MainTabNavigator";

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  Onboarding: { isEdit?: boolean } | undefined;
  MainTabs: undefined;
  Recommend: {
    wardrobeItemId: string;
    imageUrl: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "로그인" }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: "회원가입" }} />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ title: "온보딩" }}
      />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Recommend" component={RecommendScreen} options={{ title: "AI 추천" }} />
    </Stack.Navigator>
  );
}
