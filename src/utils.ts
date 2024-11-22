import { ToastAndroid } from "react-native";

export function showToast(message: string, duration: number) {
  ToastAndroid.show(message, duration);
}
