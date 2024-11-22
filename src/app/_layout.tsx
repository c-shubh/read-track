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
import { routes } from "../routes";
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
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE links (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	url TEXT NOT NULL,
	status TEXT CHECK(status in ('read', 'later')) NOT NULL,
	read_at datetime, -- js iso date string
	created_at datetime NOT NULL -- js iso date string
);
CREATE TABLE link_metadata (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	link_id INTEGER NOT NULL,
	title TEXT,
	metadata_updated_at datetime NOT NULL, -- js iso date string
	FOREIGN KEY (link_id) REFERENCES links (id) ON DELETE CASCADE
);
`);
    currentDbVersion = 1;
  }
  // if (currentDbVersion === 1) {
  //   Add more migrations
  // }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
