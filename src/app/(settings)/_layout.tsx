import { routes } from "@/src/routes";
import { DrawerActions } from "@react-navigation/native";
import { Stack, useNavigation } from "expo-router";
import React from "react";
import { IconButton } from "react-native-paper";

export default function Layout() {
  const nav = useNavigation();
  return (
    <Stack
      screenOptions={{
        headerLeft(props) {
          if (props.canGoBack) return;
          return (
            <IconButton
              icon="menu"
              size={20}
              onPress={() => nav.dispatch(DrawerActions.openDrawer())}
            />
          );
        },
      }}
    >
      <Stack.Screen
        name={routes.settings.name}
        options={{ title: routes.settings.title }}
      />
    </Stack>
  );
}
