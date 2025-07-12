import { Image } from "expo-image";
import Markdown from "react-native-markdown-display";
import React, { useState, useEffect, useRef } from "react";
import { ScrollView } from "react-native";
import { Loader } from "@googlemaps/js-api-loader";
import MapView, { PROVIDER_GOOGLE, Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import {
  Alert,
  Animated,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  PanResponder,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { shootquery } from "./FormScreen";
import { supabase } from "../lib/supabase";

function getRandomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10000) / 100000;
}

type GeoCoord = {
  latitude: number;
  longitude: number;
  nLat: number;
  sLat: number;
  eLong: number;
  wLong: number;
};

type MarkerType = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState("");
  const [geoCode, setgeoCode] = useState<GeoCoord | null>(null);
  const [markerCor, setMarkerCor] = useState<MarkerType[]>([]);
  const [answers, setAnswer] = useState<any[] | null>();
  const [llmResponse, setLlmResponse] = useState("");
  const [llmLoading, setLlmLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);
  const [markerTips, setMarkerTips] = useState<{ [id: string]: string }>({});
  const screenHeight = Dimensions.get("window").height;
  const dragY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const scrollOffsetY = useRef(0);
  const scrollY = useRef(0);
  console.log(screenHeight);
  const SNAP_POINTS = {
    collapsed: screenHeight,
    partial: screenHeight * 0.5,
    expanded: screenHeight * 0.1,
  };
  const slideAnim = useRef(new Animated.Value(SNAP_POINTS.collapsed)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5; // respond to both up and down drag
      },
      onPanResponderGrant: () => {
        dragY.setValue(0);
        slideAnim.setOffset(slideAnim._value);
      },

      onPanResponderMove: (_, gestureState) => {
        slideAnim.setValue(gestureState.dy);
      },

      onPanResponderRelease: (_, gestureState) => {
        slideAnim.flattenOffset();

        let dest = SNAP_POINTS.partial;
        if (gestureState.dy > 100) dest = SNAP_POINTS.collapsed;
        else if (gestureState.dy < -100) dest = SNAP_POINTS.expanded;

        Animated.spring(slideAnim, {
          toValue: dest,
          useNativeDriver: false,
          bounciness: 6,
        }).start(() => {
          if (dest === SNAP_POINTS.collapsed) {
            setSelectedMarker(null);
          }
        });
      },
    })
  ).current;

  function useTypingEffect(text: string, speed = 20) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
      setDisplayedText("");
      if (!text) return;

      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
        if (index >= text.length) clearInterval(interval);
      }, speed);

      return () => clearInterval(interval);
    }, [text, speed]);

    return displayedText;
  }
  const typedResponse = useTypingEffect(llmResponse);

  // Animate in
  const openPanel = () => {
    Animated.spring(slideAnim, {
      toValue: SNAP_POINTS.partial,
      useNativeDriver: false,
    }).start();
  };

  const closePanel = () => {
    Animated.spring(slideAnim, {
      toValue: SNAP_POINTS.collapsed,
      useNativeDriver: false,
    }).start(() => {
      setSelectedMarker(null);
    });
  };

  useEffect(() => {
    if (selectedMarker) {
      openPanel();
    }
  }, [selectedMarker]);
  useEffect(() => {
    if (!selectedMarker || !selectedMarker.id) return;

    const markerKey = selectedMarker.id;

    // If tip already exists, reuse it
    if (markerTips[markerKey]) {
      setLlmResponse(markerTips[markerKey]);
      return;
    }

    async function fetchLlmTips() {
      setLlmLoading(true);
      try {
        const response = await fetch("http://192.168.1.234:5001/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            camera: "Sony a6700",
            location: selectedMarker!.name,
            additional_equipment: "None",
          }),
        });

        const data = await response.json();
        const tip = data.tip || data.response || data.output || "No tip found.";

        setMarkerTips((prev) => ({
          ...prev,
          [markerKey]: tip,
        }));

        setLlmResponse(tip);
      } catch (error) {
        console.error("❌ Error fetching tip:", error);
        setLlmResponse("Failed to fetch tips.");
      } finally {
        setLlmLoading(false);
      }
    }

    fetchLlmTips();
  }, [selectedMarker]);

  const cleanedMarkdown = llmResponse.replace(/```/g, "");
  useEffect(() => {
    async function readData() {
      const { data: formAnswers1 } = await supabase
        .from("locations")
        .select("*");
      const { data: formAnswers } = await supabase
        .from("formAnswers")
        .select("*")
        .order("id", { ascending: false })
        .limit(1);
      const loc = formAnswers?.at(0)?.["location"];
      setLocation(loc);
      for (const value of formAnswers1!) {
        const locations = value.locations;

        if (locations) {
          const schoolKeys = Object.keys(locations);
          if (schoolKeys == loc) {
            setAnswer(value);
          } // ['CSUF', 'UCI', ...]
        }
      }
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          loc
        )}`,
        {
          headers: {
            "User-Agent": "photohelperapp/1.0 (your@email.com)",
            "Accept-Language": "en",
          },
        }
      );
      const data = await response.json();
      const geocodedLocation = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };

      const R = 6378137;
      const distance = 1609.34 * 0.1;
      const latRad = (geocodedLocation.lat * Math.PI) / 180;
      const lonRad = (geocodedLocation.lng * Math.PI) / 180;
      const angularDistance = distance / R;

      const nLat =
        (180 / Math.PI) *
        Math.asin(
          Math.sin(latRad) * Math.cos(angularDistance) +
            Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(0)
        );

      const sLat =
        (180 / Math.PI) *
        Math.asin(
          Math.sin(latRad) * Math.cos(angularDistance) +
            Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(Math.PI)
        );

      const eLong =
        (180 / Math.PI) *
        (lonRad +
          Math.atan2(
            Math.sin(Math.PI / 2) *
              Math.sin(angularDistance) *
              Math.cos(latRad),
            Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(latRad)
          ));

      const wLong =
        (180 / Math.PI) *
        (lonRad +
          Math.atan2(
            Math.sin((3 * Math.PI) / 2) *
              Math.sin(angularDistance) *
              Math.cos(latRad),
            Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(latRad)
          ));

      setgeoCode({
        latitude: geocodedLocation.lng,
        longitude: geocodedLocation.lat,
        nLat,
        sLat,
        wLong,
        eLong,
      });
    }

    readData();
  }, []);

  useEffect(() => {
    async function marker() {
      if (answers && markerCor.length === 0) {
        const newMarkers: MarkerType[] = [];

        const locations = answers.locations;
        const schoolLocations = locations?.[location]; // 'location' from formAnswers

        if (!schoolLocations) return;

        let i = 0;
        for (const locName in schoolLocations) {
          const coords = schoolLocations[locName];
          newMarkers.push({
            id: i.toString(), // ✅ make sure i is defined
            name: locName,
            latitude: coords.lat,
            longitude: coords.long,
          });

          i++;
        }
        setMarkerCor(newMarkers);
      }
    }
    marker();
  }, [geoCode]);

  const [radius, setRadius] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  const markdownStyles = {
    code_block: {
      backgroundColor: "transparent",
      padding: 0,
      margin: 0,
    },
    fence: {
      backgroundColor: "transparent",
      padding: 0,
      margin: 0,
    },
  };
  const sanitizeMarkdown = llmResponse
    .replace(/^\s{4}/gm, "") // remove leading 4-space indent
    .replace(/```/g, ""); // remove triple backticks
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      {loading ? (
        <View>
          <Text>Loading...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: geoCode?.longitude!,
              longitude: geoCode?.latitude!,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {markerCor &&
              markerCor.length > 0 &&
              markerCor.map((marker) => (
                <React.Fragment key={marker.id}>
                  <Marker
                    coordinate={{
                      latitude: marker.longitude, // ✅ FIXED: swapped back to correct positions
                      longitude: marker.latitude,
                    }}
                    title={marker.name}
                    onPress={() => {
                      console.log("Marker pressed:", marker); // ✅ Add this
                      setSelectedMarker(marker);
                    }}
                  />
                  <Circle
                    center={{
                      latitude: marker.longitude,
                      longitude: marker.latitude,
                    }}
                    radius={radius}
                    strokeWidth={2}
                    strokeColor="#3399ff"
                    fillColor="rgba(51, 153, 255, 0.2)"
                  />
                </React.Fragment>
              ))}
          </MapView>
          <View style={stylesMaps.buttonContainer}>
            <TouchableOpacity
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Home" }],
                })
              }
              style={styles.button}
            >
              <Text style={styles.buttonText}>Go Back Home</Text>
            </TouchableOpacity>
          </View>
          <Animated.View
            style={[
              stylesMaps.bottomSheet,
              {
                transform: [{ translateY: slideAnim }], // 👈 This lifts it above the taskbar
              },
            ]}
          >
            {/* DRAGGABLE GRIP + HEADER AREA */}
            <View style={{ flex: 1 }}>
              <View {...panResponder.panHandlers}>
                <View style={{ alignItems: "center", marginBottom: 10 }}>
                  <View
                    style={{
                      width: 40,
                      height: 5,
                      backgroundColor: "#ccc",
                      borderRadius: 2.5,
                      marginTop: 5,
                    }}
                  />
                </View>

                {selectedMarker && (
                  <View style={{ marginBottom: 10 }}>
                    <Text style={stylesMaps.sheetTitle}>
                      {selectedMarker.name}
                    </Text>
                    <Text>Latitude: {selectedMarker.latitude}</Text>
                    <Text>Longitude: {selectedMarker.longitude}</Text>
                  </View>
                )}
              </View>

              {/* SCROLLABLE CONTENT */}
              <ScrollView
                ref={scrollRef}
                style={{ paddingBottom: 40 }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
                onScroll={(e) => {
                  scrollOffsetY.current = e.nativeEvent.contentOffset.y;
                }}
              >
                {llmLoading ? (
                  <Text style={{ marginVertical: 10, fontStyle: "italic" }}>
                    Loading tips...
                  </Text>
                ) : selectedMarker && markerTips[selectedMarker.id] ? (
                  <Markdown
                    style={{
                      body: { backgroundColor: "transparent", padding: 0 },
                      // You can also customize other markdown elements here
                    }}
                  >
                    {markerTips[selectedMarker.id]
                      .replace(/^\s{4}/gm, "")
                      .replace(/```/g, "")}
                  </Markdown>
                ) : (
                  <Text>No tips available.</Text>
                )}
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

const stylesMaps = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0, // ✅ Let translateY handle where it starts
    bottom: 0, // ✅ Fill to bottom of screen
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 10,
  },
});
