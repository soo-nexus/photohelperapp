import { Image } from "expo-image";
import React, { useState, useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import MapView, { PROVIDER_GOOGLE, Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
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

type Marker = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};
export default function MapScreen({ navigation }) {
  let shootquery: string = "";
  const [location, setLocation] = useState("");
  let date: string = "";
  let inOut: string = "";
  const [geoCode, setgeoCode] = useState<GeoCoord | null>(null);
  const [markerCor, setMarkerCor] = useState<Marker[]>([]);
  const [answers, setAnswer] = useState<any[] | null>();
  useEffect(() => {
    async function readData() {
      let { data: formAnswers1, error1 } = await supabase
        .from("locations")
        .select("*")
        .order("id", { ascending: false })
        .limit(4);
      setAnswer(formAnswers1);
      let { data: formAnswers, error } = await supabase
        .from("formAnswers")
        .select("*")
        .order("id", { ascending: false })
        .limit(1);
      shootquery = formAnswers?.at(0)["shootstyle"];
      setLocation(formAnswers?.at(0)["location"]);
      date = formAnswers?.at(0)["date"];
      inOut = formAnswers?.at(0)["inOut"];
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          location
        )}&key=AIzaSyDiOmGm9Gq9SmJKWZ4A62yU7CS3TpvBGJY`
      );
      const data = await response.json();
      const geocodedLocation = data.results[0].geometry.location;
      const R = 6378137; // Radius of the Earth (in meters)
      const distance = 1609.34 * 0.1; // distance from center (1 mile
      const startLat = geocodedLocation.lat;
      const startLong = geocodedLocation.lng;
      // Convert center point to radians
      const latRad = (startLat * Math.PI) / 180;
      const lonRad = (startLong * Math.PI) / 180;
      const angularDistance = distance / R;
      // Bearings in radians
      const north = 0;
      const south = Math.PI;
      const east = Math.PI / 2;
      const west = (3 * Math.PI) / 2;

      // Latitude bounds
      const nLat =
        (180 / Math.PI) *
        Math.asin(
          Math.sin(latRad) * Math.cos(angularDistance) +
            Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(north)
        );

      const sLat =
        (180 / Math.PI) *
        Math.asin(
          Math.sin(latRad) * Math.cos(angularDistance) +
            Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(south)
        );

      // Longitude bounds — now correctly converted back to degrees
      const eLong =
        (180 / Math.PI) *
        (lonRad +
          Math.atan2(
            Math.sin(east) * Math.sin(angularDistance) * Math.cos(latRad),
            Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(latRad)
          ));

      const wLong =
        (180 / Math.PI) *
        (lonRad +
          Math.atan2(
            Math.sin(west) * Math.sin(angularDistance) * Math.cos(latRad),
            Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(latRad)
          ));

      setgeoCode({
        latitude: geocodedLocation.lng,
        longitude: geocodedLocation.lat,
        nLat: nLat,
        sLat: sLat,
        wLong: wLong,
        eLong: eLong,
      });
    }

    readData();
  });

  useEffect(() => {
    async function marker() {
      // if (shootquery != "grad") {
      // if (geoCode && markerCor.length === 0) {
      if (answers && markerCor.length === 0) {
        const newMarkers: Marker[] = [];

        // newMarkers.push({ id: "0", latitude: 33.881, longitude: -117.888 });
        // newMarkers.push({ id: "1", latitude: 33.8789, longitude: -117.885 });
        // newMarkers.push({ id: "1", latitude: 33.8785, longitude: -117.885 });

        for (let i = 0; i < answers.length!; i++) {
          const row = answers.at(i);
          if (row["type"] === "Grad") {
            newMarkers.push({
              id: i.toString(),
              name: row["locations"]["name"],
              latitude: row["locations"]["long"],
              longitude: row["locations"]["lat"],
            });
          }
        }

        setMarkerCor(newMarkers);
        console.log(newMarkers);
      }

      // for (let i = 0; i < 5; i++) {
      //   const randomLat =
      //     Math.random() * (geoCode.nLat - geoCode.sLat) + geoCode.sLat;
      //   const randomLong =
      //     Math.random() * (geoCode.eLong - geoCode.wLong) + geoCode.wLong;
      //   newMarkers.push({
      //     id: i.toString(),
      //     latitude: randomLat,
      //     longitude: randomLong,
      //   });
      // }

      // } else {
      //   console.log("hello");
      //   const newMarkers: Marker[] = [];
      //   let { data: formAnswers1, error1 } = await supabase
      //     .from("locations")
      //     .select("*")
      //     .order("id", { ascending: false })
      //     .limit(4);
      //   if (formAnswers1) {
      //     for (let i = 0; i < formAnswers1?.length!; i++) {
      //       if (formAnswers1?.at(i)["googleMapLocation"] === null) {
      //         newMarkers.push({
      //           id: i.toString(),
      //           latitude: formAnswers1.at(i)["lat"],
      //           longitude: formAnswers1.at(i)["long"],
      //         });
      //         console.log(newMarkers);
      //       }
      //     }
      //     setMarkerCor(newMarkers);
      //   }
      // }
      // }
    }
    marker();
  }, [geoCode]); // <-- only run once when geoCode is available
  const [radius, setRadius] = useState(100);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Simulate an API call or data fetching
    setTimeout(() => {
      const fetchedData = { message: "Data is loaded!" };
      setData(fetchedData);
      setLoading(false);
    }, 1000);
  }, []);
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      {loading ? (
        <View>{data && <Text>{data.message}</Text>}</View>
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
            {markerCor.map((marker, index) => (
              <React.Fragment key={index}>
                <Marker
                  key={marker.id}
                  coordinate={{
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                  }}
                  title={marker.name}
                />
                <Circle
                  center={{
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                  }}
                  radius={radius}
                  strokeWidth={2}
                  strokeColor="#3399ff"
                  fillColor="rgba(51, 153, 255, 0.2)"
                />
              </React.Fragment>
            ))}
            {/* <Marker
            coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
            title={"title"}
            description={"description"}
          />
          <Circle
            center={circleCenter}
            radius={radius}
            strokeWidth={2}
            strokeColor="#3399ff"
            fillColor="rgba(51, 153, 255, 0.2)"
          /> */}
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
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  heading: { fontSize: 18, marginBottom: 10 },
  input: {
    width: 200,
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
const stylesMaps = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
