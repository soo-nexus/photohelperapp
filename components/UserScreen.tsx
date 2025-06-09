import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
export default function UserScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Image
          style={{ width: 100, height: 100 }}
          source={require("../assets/Untitled.jpg")}
          contentFit="cover"
          transition={1000}
        />
        <Text style={{ fontSize: 20 }}>Name: Jonathan Soo</Text>
        <Text style={{ fontSize: 20 }}>Camera Used: Sony Alpha 67000</Text>
        <Text style={{ fontSize: 20 }}>
          Been Shooting Since: [when first opened app]
        </Text>
        <Text style={{ fontSize: 20 }}>Shoots Taken</Text>
        <Text style={{ fontSize: 20 }}>Tags</Text>
        <Button
          title="Go Back to Home"
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}
