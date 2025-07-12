import React from "react";
import { useRoute } from "@react-navigation/native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native";

export default function FirstInstruction({ navigation }) {
  const route = useRoute();
  const hideStatusBar = route.name === "Home";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar hidden={hideStatusBar} />
      <View style={styles.container}>
        <Text style={styles.title}>Enter Your School</Text>

        {/* Stack images vertically */}
        <View style={styles.imageStack}>
          <Image
            style={styles.image}
            source={require("../assets/167a79de-b859-40f7-b2c0-84763a4ec4d6-2.png")}
            contentFit="cover"
            transition={1000}
          />
          <Image
            style={styles.image1}
            source={require("../assets/ChatGPT Image Jul 10, 2025, 09_52_26 PM.png")}
            contentFit="cover"
            transition={1000}
          />
        </View>

        <Text style={styles.description}>
          Location markers will be generated on the best places to take a photo
        </Text>
        {/* <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.replace("SecondInstruction")}
        >
          <Text style={styles.exploreText}>Next</Text>
        </TouchableOpacity> */}
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
    width: 300,
    height: 100,
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
