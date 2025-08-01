import React from "react";
import { useRoute } from "@react-navigation/native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreenIntro({ navigation }) {
  const route = useRoute();
  const hideStatusBar = route.name === "Home";
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar hidden={hideStatusBar} />
      <View style={styles.container}>
        {/* Image */}
        <Image
          style={styles.image}
          source={require("../assets/167a79de-b859-40f7-b2c0-84763a4ec4d6.png")}
          contentFit="cover"
          transition={1000}
        />

        {/* Centered Text */}
        <Text style={styles.description}>
          An app to help you capture better graduation photos
        </Text>

        {/* Button */}
        {/* <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.replace("FirstInstruction")}
        >
          <Text style={styles.exploreText}>Get Started</Text>
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
}

// 📐 Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    zIndex: 10,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  description: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "500",
    color: "#333",
    paddingHorizontal: 10,
  },
  exploreButton: {
    backgroundColor: "#438e6c",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  exploreText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
