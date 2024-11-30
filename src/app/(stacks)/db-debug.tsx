import { useSQLiteContext } from "expo-sqlite";
import React from "react";
import { ToastAndroid, View } from "react-native";
import { Button } from "react-native-paper";
import { useMutation, useQueryClient } from "react-query";
import { LinkRepository } from "../../storage";
import { showToast } from "../../utils";

export default function DbDebug() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const deleteAllMutation = useMutation({
    mutationFn() {
      return LinkRepository.deleteAllLinks(db);
    },
    onSuccess() {
      queryClient.invalidateQueries(["links"]);
      showToast("Deleted all links", ToastAndroid.SHORT);
    },
  });
  const seedDataMutation = useMutation({
    mutationFn() {
      return LinkRepository.clearDbAndSeedData(db);
    },
    onSuccess() {
      queryClient.invalidateQueries(["links", "metadata"]);
      showToast("Seeded data", ToastAndroid.SHORT);
    },
  });

  return (
    <View className="flex flex-col p-4 gap-4">
      <Button
        icon={"delete"}
        mode="contained"
        onPress={() => {
          deleteAllMutation.mutate();
        }}
      >
        Delete all
      </Button>
      <Button
        icon={"database-arrow-left"}
        mode="contained"
        onPress={() => {
          seedDataMutation.mutate();
        }}
      >
        Seed data
      </Button>
    </View>
  );
}
