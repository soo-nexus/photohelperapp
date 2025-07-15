import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Feather from "react-native-vector-icons/Feather"; // ⬅️ icon import

export default function UserScreen({ navigation }) {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("Jonathan Soo");
  const [camera, setCamera] = useState("Sony Alpha 6700");
  const [beenShooting, setBeenShooting] = useState("June 2024");
  const [shootsTaken, setShootsTaken] = useState("12");
  const [tags, setTags] = useState("Portrait, Natural Light");

  const renderField = (label, value, setValue) => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {editMode ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          multiline
        />
      ) : (
        <Text style={styles.sectionValue}>{value}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top bar with pencil icon */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => setEditMode(!editMode)}>
          <Feather name="edit-2" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Image
          style={styles.avatar}
          source={require("../assets/Untitled.jpg")}
        />

        {editMode ? (
          <TextInput
            style={[styles.input, { textAlign: "center", fontSize: 22 }]}
            value={name}
            onChangeText={setName}
          />
        ) : (
          <Text style={styles.name}>{name}</Text>
        )}

        {editMode ? (
          <TextInput
            style={[styles.input, { textAlign: "center" }]}
            value={camera}
            onChangeText={setCamera}
          />
        ) : (
          <Text style={styles.camera}>📷 {camera}</Text>
        )}

        {renderField("📅 Been Shooting Since:", beenShooting, setBeenShooting)}
        {renderField("🖼️ Shoots Taken:", shootsTaken, setShootsTaken)}
        {renderField("🏷️ Style:", tags, setTags)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 4,
  },
  camera: {
    fontSize: 16,
    color: "#555",
    marginBottom: 24,
  },
  section: {
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
  },
  sectionValue: {
    fontSize: 16,
    color: "#666",
  },
  input: {
    width: "100%",
    fontSize: 16,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginTop: 4,
  },
});
