import { routes } from "@/src/routes";
import { DrawerActions } from "@react-navigation/native";
import { Stack, useNavigation } from "expo-router";
import React from "react";
import { IconButton } from "react-native-paper";

export default function StacksLayout() {
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
        name={routes.index.name}
        options={{ title: routes.index.title }}
      />
      <Stack.Screen
        name={routes.newLink.name}
        options={{ title: routes.newLink.title }}
      />
      <Stack.Screen
        name={routes.dbDebug.name}
        options={{ title: routes.dbDebug.title }}
      />
    </Stack>
  );
}
