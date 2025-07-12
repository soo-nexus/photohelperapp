import React from "react";
import { useRoute } from "@react-navigation/native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native";

export default function SecondInstructions({ navigation }) {
  const route = useRoute();
  const hideStatusBar = route.name === "Home";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar hidden={hideStatusBar} />
      <View style={styles.container}>
        <Text style={styles.title}>Tap on a Marker</Text>

        {/* Stack images vertically */}
        <View style={styles.imageStack}>
          <Image
            style={styles.image}
            source={require("../assets/35c03777-dede-4308-85d1-920cfe5d42c5.png")}
            contentFit="cover"
            transition={1000}
          />
        </View>

        <Text style={styles.description}>
          Tap on a location to get tailored tips
        </Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.replace("Main")}
        >
          <Text style={styles.exploreText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  exploreText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  exploreButton: {
    backgroundColor: "#438e6c",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  imageStack: {
    alignItems: "center",
  },
  image: {
    width: 350,
    height: 300,
    resizeMode: "contain",
    marginBottom: -30, // small spacing between the two images
  },
  image1: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  title: {
    paddingTop: 50,
    textAlign: "center",
    fontSize: 30,
    fontWeight: "500",
    color: "#333",
  },
  description: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "500",
    color: "#333",
    paddingHorizontal: 10,
  },
});
