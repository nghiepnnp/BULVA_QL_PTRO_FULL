import { translateMessage } from "@/i18n/core";
import { Alert, Platform, type AlertButton } from "react-native";

/** Single confirmation/error API for Expo Web and iOS/Android. */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
): void {
  title = translateMessage(title);
  message = message ? translateMessage(message) : message;
  buttons = buttons?.map((button) => ({
    ...button,
    text: button.text ? translateMessage(button.text) : button.text,
  }));
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons);
    return;
  }
  if (typeof window === "undefined") return;
  if (!buttons?.length) {
    window.alert([title, message].filter(Boolean).join("\n"));
    return;
  }
  const action = [...buttons]
    .reverse()
    .find((button) => button.style !== "cancel" && button.onPress);
  if (!action) {
    window.alert([title, message].filter(Boolean).join("\n"));
    return;
  }
  if (window.confirm([title, message].filter(Boolean).join("\n")))
    action.onPress?.();
}
