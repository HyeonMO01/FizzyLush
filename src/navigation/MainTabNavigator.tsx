import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/HomeScreen";
import { UploadScreen } from "../screens/UploadScreen";
import { MyPageScreen } from "../screens/MyPageScreen";

export type MainTabParamList = {
  Home: undefined;
  Upload: undefined;
  MyPage: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: "center",
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "홈" }} />
      <Tab.Screen name="Upload" component={UploadScreen} options={{ title: "업로드" }} />
      <Tab.Screen name="MyPage" component={MyPageScreen} options={{ title: "마이페이지" }} />
    </Tab.Navigator>
  );
}
