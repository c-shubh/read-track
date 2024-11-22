import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import merge from "deepmerge";
import { Stack } from "expo-router";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  adaptNavigationTheme,
} from "react-native-paper";
import { QueryClient, QueryClientProvider } from "react-query";
import "./global.css";

const queryClient = new QueryClient();

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const paperTheme =
    colorScheme === "dark" ? CombinedDarkTheme : CombinedDefaultTheme;

  return (
    <SQLiteProvider databaseName="readtrack.db" onInit={migrateDbIfNeeded}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          {/* @ts-ignore */}
          <ThemeProvider value={paperTheme}>
            <StatusBar />
            <Stack>
              <Stack.Screen name="index" options={{ title: "Home" }} />
              <Stack.Screen name="new-link" options={{ title: "New Link" }} />
            </Stack>
          </ThemeProvider>
        </PaperProvider>
      </QueryClientProvider>
    </SQLiteProvider>
  );
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  const getUserVersionResponse = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");
  if (getUserVersionResponse === null) {
    throw new Error("Failed to get: PRAGMA user_version");
  }
  let { user_version: currentDbVersion } = getUserVersionResponse;
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }
  if (currentDbVersion === 0) {
    await db.execAsync(`
PRAGMA journal_mode = 'wal';
CREATE TABLE links (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	url TEXT NOT NULL,
	status TEXT CHECK(status in ('read', 'later')) NOT NULL,
	read_at datetime,
	created_at datetime NOT NULL
);
`);
    currentDbVersion = 1;
  }
  // if (currentDbVersion === 1) {
  //   Add more migrations
  // }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
