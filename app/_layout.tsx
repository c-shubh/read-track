import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import "./global.css";

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Home" }} />
        <Stack.Screen name="new-link" options={{ title: "New Link" }} />
      </Stack>
    </PaperProvider>
  );
}
