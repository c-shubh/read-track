import { LinkRepository } from "@/src/storage";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { AnimatedFAB, Button, Chip, List } from "react-native-paper";
import { useQuery } from "react-query";
import { routes } from "../../routes";
import { useShareIntentContext } from "expo-share-intent";

export default function Index() {
  const { hasShareIntent, shareIntent, resetShareIntent } =
    useShareIntentContext();
  const router = useRouter();
  const db = useSQLiteContext();
  useDrizzleStudio(db);
  const allLinksJoinedMetadataQuery = useQuery(["links", "metadata"], () =>
    LinkRepository.getAllLinksJoinedMetadata(db)
  );
  const readLinksJoinedMetadataQuery = useQuery(
    ["links", "metadata", "read"],
    () => LinkRepository.getReadLinksJoinedMetadata(db)
  );
  const laterLinksJoinedMetadataQuery = useQuery(
    ["links", "metadata", "later"],
    () => LinkRepository.getLaterLinksJoinedMetadata(db)
  );
  const [showRead, setShowRead] = useState(false);
  const [showUnread, setShowUnread] = useState(true);
  const query =
    showRead && showUnread
      ? allLinksJoinedMetadataQuery
      : showRead
      ? readLinksJoinedMetadataQuery
      : showUnread
      ? laterLinksJoinedMetadataQuery
      : null;

  // Handle share intent navigation
  useEffect(() => {
    if (hasShareIntent && shareIntent.text) {
      // Use a short timeout to ensure navigation happens after component mount
      const timer = setTimeout(() => {
        router.push({
          pathname: routes.newLink.url,
          params: { url: shareIntent.text },
        });
        resetShareIntent();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [hasShareIntent, shareIntent.text]);

  return (
    <View className="flex-1 p-4 gap-4">
      {/* Chips */}
      <View className="flex flex-row gap-2">
        <Chip onPress={() => setShowRead(!showRead)} selected={showRead}>
          Read
        </Chip>
        <Chip onPress={() => setShowUnread(!showUnread)} selected={showUnread}>
          Unread
        </Chip>
      </View>
      {
        // TODO: remove this later
      }
      <Button
        mode="contained"
        icon={"database-cog-outline"}
        onPress={() => router.push(routes.dbDebug.url)}
      >
        Db Debug
      </Button>
      {/* List / Loading */}
      {query?.isLoading && <Text>Loading...</Text>}
      {query?.data && (
        <FlatList
          data={query?.data}
          renderItem={({ item }) => (
            <List.Item
              // if title is not present, show url as title
              title={item.title || item.url}
              // only show description if title is present
              description={item.title && item.url}
            />
          )}
        />
      )}

      {/* FAB (it's out of the normal element flow) */}
      <AnimatedFAB
        icon={"plus"}
        extended={false}
        label={"New Link"}
        iconMode={"static"}
        onPress={() => router.push(routes.newLink.url)}
        className="absolute bottom-4 right-4"
      />
    </View>
  );
}
