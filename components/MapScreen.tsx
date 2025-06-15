import { Image } from "expo-image";
import React, { useState, useEffect, useRef } from "react";
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
  const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);
  const screenHeight = Dimensions.get("window").height;
  console.log(screenHeight);
  const sheetHeight = screenHeight; // Full height so it can slide

  const SNAP_POINTS = {
    collapsed: screenHeight,
    partial: screenHeight * 0.5,
    expanded: screenHeight * 0.1,
  };
  const slideAnim = useRef(new Animated.Value(SNAP_POINTS.collapsed)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        slideAnim.setOffset(slideAnim._value);
        slideAnim.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        slideAnim.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        slideAnim.flattenOffset();
        const currentValue = slideAnim._value;
        const swipeDistance = gestureState.dy;

        let dest = SNAP_POINTS.partial;

        if (swipeDistance > 100) {
          // Swiped down
          dest = SNAP_POINTS.collapsed;
        } else if (swipeDistance < -100) {
          // Swiped up
          dest = SNAP_POINTS.expanded;
        }

        Animated.spring(slideAnim, {
          toValue: dest,
          useNativeDriver: false,
          bounciness: 6,
        }).start(() => {
          if (dest === SNAP_POINTS.collapsed) {
            setSelectedMarker(null); // hide content when sheet is fully closed
          }
        });
      },
    })
  ).current;

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
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          loc
        )}&key=AIzaSyDiOmGm9Gq9SmJKWZ4A62yU7CS3TpvBGJY`
      );
      const data = await response.json();
      const geocodedLocation = data.results[0].geometry.location;

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
            id: i.toString(),
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
            {...panResponder.panHandlers}
            style={[
              stylesMaps.bottomSheet,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <View
                style={{
                  width: 40,
                  height: 5,
                  backgroundColor: "#ccc",
                  borderRadius: 2.5,
                }}
              />
            </View>
            {selectedMarker && (
              <>
                <Text style={stylesMaps.sheetTitle}>{selectedMarker.name}</Text>
                <Text>Latitude: {selectedMarker.latitude}</Text>
                <Text>Longitude: {selectedMarker.longitude}</Text>
                <TouchableOpacity
                  onPress={() => {
                    Animated.spring(slideAnim, {
                      toValue: SNAP_POINTS.collapsed,
                      useNativeDriver: false,
                    }).start(() => setSelectedMarker(null));
                  }}
                  style={stylesMaps.closeButton}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
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
    height: 852,
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
