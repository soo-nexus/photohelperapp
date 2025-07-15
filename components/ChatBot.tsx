import React from "react";
import { WebView } from "react-native-webview";

export default function ChatScreen() {
  return (
    <WebView
      originWhitelist={["*"]}
      source={require("../selenium 2/bot.html")}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      style={{ flex: 1 }}
    />
  );
}
