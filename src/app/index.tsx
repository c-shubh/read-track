import { LinkRepository } from "@/src/storage";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { AnimatedFAB, Button, Chip, List } from "react-native-paper";
import { useQuery } from "react-query";
import { routes } from "../routes";

export default function Index() {
  const router = useRouter();
  const db = useSQLiteContext();
  const allLinksJoinedMetadataQuery = useQuery(["links", "metadata"], () =>
    LinkRepository.getAllLinksJoinedMetadata(db)
  );
  const [showRead, setShowRead] = useState(false);
  const [showUnread, setShowUnread] = useState(true);

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
      {allLinksJoinedMetadataQuery.isLoading && <Text>Loading...</Text>}
      {allLinksJoinedMetadataQuery.data && (
        <FlatList
          data={allLinksJoinedMetadataQuery.data}
          renderItem={({ item }) => (
            <List.Item title={item.title} description={item.url} />
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
