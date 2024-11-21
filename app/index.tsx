import { LinkRepository } from "@/src/storage";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { FlatList, Text, View } from "react-native";
import { AnimatedFAB, List } from "react-native-paper";
import { useQuery } from "react-query";

export default function Index() {
  const router = useRouter();
  const db = useSQLiteContext();
  const query = useQuery("allLinks", () => LinkRepository.getAllLinks(db));

  console.log(query.data);

  return (
    <View className="flex-1">
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
        onPress={() => router.push("/new-link")}
        className="absolute bottom-4 right-4"
      />
    </View>
  );
}
