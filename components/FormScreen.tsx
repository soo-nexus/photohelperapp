import "react-native-get-random-values";
import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
  Platform,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../lib/supabase";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const Formscreen = ({ navigation }) => {
  const [step, setStep] = useState(1);

  const [shootquery, setshootQuery] = useState("");
  const [locationquery, setlocationQuery] = useState("");
  const [datequery, setDateQuery] = useState<Date>(new Date());
  const [timequery, settimeQuery] = useState<Date>(new Date());
  const [inoroutquery, setInOrOutQuery] = useState<Boolean | null | String>(
    null
  );
  const [oncampusquery, setOnCampusQuery] = useState<Boolean | null>(null);
  const [gradCollege, setGradCollege] = useState("");

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  const [search, setSearch] = useState("");
  const [filteredSchools, setFilteredSchools] = useState<string[]>([]);
  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDateQuery(selectedDate);
    }
  };

  const onChangeTime = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      settimeQuery(selectedTime);
    }
  };

  const ref = useRef<typeof GooglePlacesAutocomplete>(null);
  const schoolDirectory = [
    "University of California, Berkeley",
    "California State University, Fullerton",
    "University of California, Davis",
    "University of California, Los Angeles",
    "University of California, Irvine",
    "University of California, Santa Barbara",
    "California Polytechnic State University",
    "California State University, Sacramento",
    "University of California, Riverside",
    "University of California Merced",
    "University of California Santa Cruz",

    // ... add more schools here
  ];
  const handleSearch = (text) => {
    setSearch(text);
    const filtered = schoolDirectory.filter((school) =>
      school.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSchools(filtered);
  };

  const handleSelect = (school) => {
    setlocationQuery(school);
    setSearch(school);
    setFilteredSchools([]); // close dropdown
  };
  async function handleSubmit() {
    // 1. Insert into Supabase FIRST
    const { error: insertError } = await supabase.from("formAnswers").insert([
      {
        shootstyle: shootquery,
        location: locationquery,
        date: datequery.toLocaleDateString(),
        time: timequery.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
        inOut: inoroutquery,
      },
    ]);

    if (insertError) {
      console.error("❌ Supabase insert failed:", insertError);
      return; // Don't proceed if insert fails
    }

    console.log("✅ Supabase insert success");

    // 2. Now trigger the backend to scrape based on latest entry
    try {
      const response = await fetch("http://192.168.1.234:5001/run-main", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn(
          `⚠️ Backend returned error: ${data.error || "Unknown error"}`
        );
      } else {
        console.log("✅ Backend response:", data);
      }
    } catch (err) {
      console.warn("⚠️ Backend fetch error:", err);
    }

    navigation.navigate("Map");
  }

  // UI steps:
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.heading}>What is your shoot type?</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={shootquery}
                onValueChange={(itemValue) => setshootQuery(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select shoot type..." value="" />
                <Picker.Item label="Wedding" value="wedding" />
                <Picker.Item label="Street" value="street" />
                <Picker.Item label="Portrait" value="portrait" />
                <Picker.Item label="Grad" value="grad" />
              </Picker>
            </View>
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.heading}>Where is the location?</Text>
            {shootquery == "grad" ? (
              <View style={{ zIndex: 10 }}>
                <TextInput
                  placeholder="Search for a school"
                  value={search}
                  onChangeText={handleSearch}
                  style={{
                    height: 40,
                    borderColor: "gray",
                    borderWidth: 1,
                    paddingHorizontal: 8,
                    borderRadius: 5,
                  }}
                />
                {filteredSchools.length > 0 && (
                  <FlatList
                    data={filteredSchools}
                    keyExtractor={(item) => item}
                    style={{
                      position: "absolute",
                      top: 45,
                      backgroundColor: "white",
                      width: "100%",
                      maxHeight: 200,
                      borderColor: "gray",
                      borderWidth: 1,
                      borderRadius: 5,
                    }}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => handleSelect(item)}>
                        <Text style={{ padding: 10 }}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            ) : (
              <TextInput
                placeholder="Location"
                value={locationquery}
                onChangeText={setlocationQuery}
                style={styles.input}
              />
            )}
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.heading}>Select the date</Text>
            <Button
              title="Select Date"
              onPress={() => setShowDatePicker(true)}
            />
            <Text style={{ marginTop: 8 }}>
              Selected Date: {datequery.toLocaleDateString()}
            </Text>
            {showDatePicker && (
              <DateTimePicker
                value={datequery}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.heading}>Select the time</Text>
            <Button
              title="Select Time"
              onPress={() => setShowTimePicker(true)}
            />
            <Text style={{ marginTop: 8 }}>
              Selected Time:{" "}
              {timequery.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            {showTimePicker && (
              <DateTimePicker
                value={timequery}
                mode="time"
                display="default"
                is24Hour={true}
                onChange={onChangeTime}
              />
            )}
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.heading}>
              Are you taking photos inside, outside, or both?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.customButton}
                onPress={() => setInOrOutQuery(true)}
              >
                <Text style={styles.buttonText}>Inside</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customButton}
                onPress={() => setInOrOutQuery(false)}
              >
                <Text style={styles.buttonText}>Outside</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customButton}
                onPress={() => setInOrOutQuery("Both")}
              >
                <Text style={styles.buttonText}>Both</Text>
              </TouchableOpacity>
            </View>
          </>
        );
      default:
        return null;
    }
  };

  const isLastStep = () => {
    if (shootquery === "grad") {
      return step === 5;
    } else {
      return step === 5;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {renderStep()}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
          }}
        >
          {step > 1 && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          {!isLastStep() ? (
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setStep(step + 1)}
            >
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.navButton} onPress={handleSubmit}>
              <Text style={styles.navButtonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  picker: {
    height: 200,
    width: "100%",
    backgroundColor: "#f9f9f9",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  customButton: {
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
  },
  buttonText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  navButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  navButtonText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});

export default Formscreen;
