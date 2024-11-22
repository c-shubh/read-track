import { LinkRepository } from "@/src/storage";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { AnimatedFAB, Chip, List } from "react-native-paper";
import { useQuery } from "react-query";
import { routes } from "../routes";

export default function Index() {
  const router = useRouter();
  const db = useSQLiteContext();
  const query = useQuery("allLinks", () => LinkRepository.getAllLinks(db));
  const [showRead, setShowRead] = useState(false);
  const [showUnread, setShowUnread] = useState(true);

  console.log(query.data);

  return (
    <View className="flex-1 p-4">
      <View className="flex flex-row gap-2">
        <Chip onPress={() => setShowRead(!showRead)} selected={showRead}>
          Read
        </Chip>
        <Chip onPress={() => setShowUnread(!showUnread)} selected={showUnread}>
          Unread
        </Chip>
      </View>
      {query.isLoading && <Text>Loading...</Text>}
      {query.data && (
        <FlatList
          data={query.data}
          renderItem={({ item }) => <List.Item title={item.url} />}
        />
      )}
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
