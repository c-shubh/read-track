import { Link, useNavigation, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { AnimatedFAB } from "react-native-paper";

export default function Index() {
  const router = useRouter();
  return (
    <View className="flex-1">
      <Text>Edit app/index.tsx to edit this screen.</Text>
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
