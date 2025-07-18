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
  const [camera, setCamera] = useState("");
  const [additionalGear, setAdditionalGear] = useState("");

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
    "University of California, Davis",
    "University of California, Los Angeles",
    "University of California, Irvine",
    "University of California, Santa Barbara",
    "University of California, Riverside",
    "University of California Merced",
    "University of California Santa Cruz",
    "University of California San Diego",
    "University of California",
    "California Polytechnic State University",
    "California State Polytechnic University, Pomona",
    "California State University, Sacramento",
    "California State University, Fullerton",
    "California State University, Long Beach",
    "California State University, Sacramento",
    "California State University, Bakersfield",
    "San Jose State University",
    "San Diego State University",
    "California State University, Bakersfield",
    "California State University, Sacramento",
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
    setFilteredSchools([]);
  };

  async function handleSubmit() {
    // Format date and time
    const formattedDate = datequery.toLocaleDateString();
    const formattedTime = timequery.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Geocode location
    const geocodeRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        locationquery
      )}`,
      {
        headers: {
          "User-Agent": "photohelperapp/1.0 (support@example.com)",
          "Accept-Language": "en",
        },
      }
    );

    const geocodeData = await geocodeRes.json();

    if (!geocodeData || geocodeData.length === 0) {
      console.error("❌ Geocoding failed. No results found.");
      return;
    }

    const lat = parseFloat(geocodeData[0].lat);
    const lon = parseFloat(geocodeData[0].lon);

    // Format date for Visual Crossing API
    const targetDateStr = `${datequery.getFullYear()}-${String(
      datequery.getMonth() + 1
    ).padStart(2, "0")}-${String(datequery.getDate()).padStart(2, "0")}`;

    let weatherSummary = null;

    try {
      const API_KEY = "85WPBP76DTTS4BH64DBYEPN5Z"; // Replace this
      const weatherUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/${targetDateStr}?unitGroup=us&include=days&key=${API_KEY}`;

      const weatherRes = await fetch(weatherUrl);
      const contentType = weatherRes.headers.get("content-type");
      const rawText = await weatherRes.text();

      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ Unexpected response:", rawText);
      } else {
        const weatherData = JSON.parse(rawText);
        if (weatherData.days && weatherData.days.length > 0) {
          const day = weatherData.days[0];

          // Generate a single text weather summary
          weatherSummary = `${day.conditions} with a high of ${
            day.tempmax
          }°F, low of ${day.tempmin}°F, and ${
            day.precip || 0
          }in of precipitation.`;
        } else {
          console.warn("⚠️ No weather data found for that date.");
        }
      }
    } catch (err) {
      console.error("❌ Error fetching weather data:", err);
    }

    // Insert into Supabase with weather summary
    const { error: insertError } = await supabase.from("formAnswers").insert([
      {
        location: locationquery,
        date: formattedDate,
        time: formattedTime,
        inOut: inoroutquery,
        camera: camera,
        gear: additionalGear,
        weather_summary: weatherSummary,
      },
    ]);

    if (insertError) {
      console.error("❌ Supabase insert failed:", insertError);
      return;
    }

    console.log("✅ Supabase insert success");

    // Trigger backend
    try {
      const response = await fetch("http://192.168.1.234:5001/run-main", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const backendData = await response.json();

      if (!response.ok) {
        console.warn(
          `⚠️ Backend returned error: ${backendData.error || "Unknown error"}`
        );
      } else {
        console.log("✅ Backend response:", backendData);
      }
    } catch (err) {
      console.warn("⚠️ Backend fetch error:", err);
    }

    // Navigate to Map
    navigation.navigate("Map");
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.heading}>What camera do you have?</Text>
            <TextInput
              placeholder="e.g. Canon R5"
              value={camera}
              onChangeText={setCamera}
              style={styles.input}
            />
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.heading}>
              What additional gear do you have?
            </Text>
            <TextInput
              placeholder="e.g. Tripod, Gimbal, 50mm lens"
              value={additionalGear}
              onChangeText={setAdditionalGear}
              style={styles.input}
              multiline
            />
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.heading}>Where is the location?</Text>
            <View style={{ zIndex: 10 }}>
              <TextInput
                placeholder="Search for a school"
                value={search}
                onChangeText={handleSearch}
                style={styles.input}
              />
              {filteredSchools.length > 0 && (
                <FlatList
                  data={filteredSchools}
                  keyExtractor={(item) => item}
                  style={styles.dropdown}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSelect(item)}>
                      <Text style={{ padding: 10 }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </>
        );
      case 4:
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
      case 5:
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
      case 6:
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

  const isLastStep = () => step === 6;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {renderStep()}

        <View style={styles.navigationRow}>
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // or whatever your background is
  },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    width: 300,
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
    marginTop: 5,
  },
  customButton: {
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 8,
    paddingVertical: 5,
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
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  dropdown: {
    position: "absolute",
    top: 45,
    backgroundColor: "white",
    width: "100%",
    maxHeight: 200,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    zIndex: 20,
  },
});

export default Formscreen;
