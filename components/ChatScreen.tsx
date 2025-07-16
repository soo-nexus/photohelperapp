import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
export default function ChatScreen({ navigation }) {
  return (
    <SafeAreaView
      style={{ flex: 1, paddingBottom: -50, backgroundColor: "white" }}
      edges={["top", "bottom"]}
    >
      <WebView
        originWhitelist={["*"]}
        source={require("../selenium 2/bot.html")}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={{ flex: 1, backgroundColor: "white" }}
        keyboardDisplayRequiresUserAction={false}
        injectedJavaScript={`
        document.body.style.webkitTouchCallout = 'none';
        document.body.style.webkitUserSelect = 'none';
      `}
      />
    </SafeAreaView>
  );
}
