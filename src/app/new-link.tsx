import { LinkEntity, LinkRepository } from "@/src/storage";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import { View } from "react-native";
import { Button, RadioButton, Text, TextInput } from "react-native-paper";

export default function NewLink() {
  /* -------------------------------- Hooks --------------------------------- */
  const db = useSQLiteContext();
  const [url, setUrl] = React.useState("");
  const [status, setStatus] = React.useState<LinkEntity["status"]>("read");
  const [date, setDate] = React.useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  /* ------------------------------ Functions ------------------------------- */
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

  /* --------------------------------- View --------------------------------- */
  return (
    <View className="p-4 flex flex-col gap-5">
      {/* URL */}
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

      <Button
        mode="contained"
        onPress={() => {
          LinkRepository.saveLink(db, url, status, date);
        }}
      >
        Save
      </Button>
    </View>
  );
}