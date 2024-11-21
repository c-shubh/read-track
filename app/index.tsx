import { Link, useNavigation, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { AnimatedFAB } from "react-native-paper";

export default function Index() {
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <AnimatedFAB
        icon={"plus"}
        extended={false}
        label={"New Link"}
        iconMode={"static"}
        onPress={() => router.push("/new-link")}
        style={{ bottom: 16, right: 16, position: "absolute" }}
      />
    </View>
  );
}
