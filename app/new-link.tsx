import React from "react";
import { View } from "react-native";
import { RadioButton, Text, TextInput } from "react-native-paper";

export default function NewLink() {
  const [url, setUrl] = React.useState("");
  const [status, setStatus] = React.useState("read");

  return (
    <View
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <TextInput
        label="URL"
        value={url}
        placeholder="Enter URL"
        onChangeText={(text) => setUrl(text)}
      />

      <View>
        <Text variant="titleMedium">Status</Text>
        <RadioButton.Group
          onValueChange={(newValue) => setStatus(newValue)}
          value={status}
        >
          <RadioButton.Item label="Read" value="read" />
          <RadioButton.Item label="Later" value="later" />
        </RadioButton.Group>
      </View>
    </View>
  );
}
