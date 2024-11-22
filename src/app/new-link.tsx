import {
  FetchedMetadata,
  fetchUrlMetadata,
  LinkEntity,
  LinkMetadataRepository,
  LinkRepository,
} from "@/src/storage";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import { ToastAndroid, View } from "react-native";
import { Button, RadioButton, Text, TextInput } from "react-native-paper";
import { useMutation, useQueryClient } from "react-query";
import { showToast } from "../utils";

interface LinkData {
  url: string;
  status: LinkEntity["status"];
  date: Date;
}

interface SaveMetadataMutationFnIn {
  linkId: number;
  metadata: FetchedMetadata;
}

export default function NewLink() {
  /* -------------------------------- Hooks --------------------------------- */

  const db = useSQLiteContext();
  // TODO: remove default value
  const [url, setUrl] = React.useState("https://cshubh.com");
  const [status, setStatus] = React.useState<LinkEntity["status"]>("read");
  const [date, setDate] = React.useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const saveLinkMutation = useMutation({
    mutationFn: (data: LinkData) => saveLinkMutationFn(db, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["links"] }),
  });
  const saveMetadataMutation = useMutation({
    mutationFn: (data: SaveMetadataMutationFnIn) =>
      saveMetadataMutationFn(db, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["metadata"] }),
  });

  /* ------------------------------ Functions ------------------------------- */

  const saveMetadataMutationFn = (
    db: SQLiteDatabase,
    { linkId, metadata }: SaveMetadataMutationFnIn
  ) => {
    return LinkMetadataRepository.insertMetadata(db, linkId, metadata);
  };

  const saveLinkMutationFn = (
    db: SQLiteDatabase,
    { url, status, date }: LinkData
  ) => {
    if (status === "read")
      return LinkRepository.saveReadLink(db, url, status, date);
    if (status === "later")
      return LinkRepository.saveLaterLink(db, url, status);
    throw new Error("Unreachable");
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const onChangeTime = (event: DateTimePickerEvent, selectedTime?: Date) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(false);
    setDate(currentTime);
  };

  const saveLink = async () => {
    //  TODO: Validate
    saveLinkMutation.mutate(
      { date, status, url },
      {
        async onSuccess(data) {
          showToast("Link saved successfully.", ToastAndroid.SHORT);
          router.back();

          // fetch metadata and insert into table
          const insertedId = data.lastInsertRowId;
          const metadata = await fetchUrlMetadata(url);
          // insert metadata into table
          saveMetadataMutation.mutate(
            { linkId: insertedId, metadata },
            {
              onSuccess: () =>
                showToast(
                  "Fetched metadata saved successfully.",
                  ToastAndroid.SHORT
                ),
            }
          );
        },
      }
    );

    if (saveLinkMutation.isSuccess) {
    }
  };

  /* --------------------------------- View --------------------------------- */

  return (
    <View className="p-4 flex flex-col gap-5">
      {/* URL */}
      {
        // TODO: do not capitalize first letter
      }
      <TextInput
        label="URL"
        value={url}
        placeholder="Enter URL"
        onChangeText={(text) => setUrl(text)}
        autoFocus
      />

      {/* Status radio */}
      <View>
        <Text variant="titleMedium">Status</Text>
        <RadioButton.Group
          onValueChange={(newValue) => setStatus(newValue as any)}
          value={status}
        >
          <RadioButton.Item label="Read" value="read" />
          <RadioButton.Item label="Later" value="later" />
        </RadioButton.Group>
      </View>

      {status === "read" && (
        <React.Fragment>
          <Text variant="titleMedium">Read at</Text>
          <View className="flex flex-row gap-4">
            {/* Date select */}
            <Button
              icon="calendar-edit"
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
            >
              {dayjs(date).format("D MMMM YYYY")}
            </Button>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                onChange={onChangeDate}
              />
            )}
            {/* Time select */}
            <Button
              icon="clock-edit-outline"
              mode="outlined"
              onPress={() => setShowTimePicker(true)}
            >
              {dayjs(date).format("hh:mm a")}
            </Button>
            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                onChange={onChangeTime}
              />
            )}
          </View>
        </React.Fragment>
      )}

      <Button mode="contained" onPress={saveLink}>
        Save
      </Button>
    </View>
  );
}
