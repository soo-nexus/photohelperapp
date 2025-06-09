import React, { useState } from "react";
import { Image } from "expo-image";
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
export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Image
          style={{ width: 100, height: 100 }}
          source={require("../assets/360_F_107579101_QVlTG43Fwg9Q6ggwF436MPIBTVpaKKtb.jpg")}
          contentFit="cover"
          transition={1000}
        />
        <Text style={styles.title}>[Insert App Name]</Text>
        <Text style={styles.subtitle}>for photographers everywhere</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#007bff" }]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#28a745" }]}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.exploreButton]}
          onPress={() => navigation.navigate("Explore")}
        >
          <Text style={styles.exploreText}>Go to Explore</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: "bold",
  },
  subtitle: {
    marginBottom: 20,
    color: "#666",
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  exploreButton: {
    marginTop: 10,
    backgroundColor: "#6c757d",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  exploreText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
