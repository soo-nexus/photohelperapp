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
export default function ExploreScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Explore</Text>
        <Button
          title="Go to Forms"
          onPress={() => navigation.navigate("Form")}
        />
      </View>
    </SafeAreaView>
  );
}
