import React from "react";
import Swiper from "react-native-swiper";
import { Dimensions, View, StyleSheet } from "react-native";

import HomeScreen from "../components/Homescreen";
import FirstInstruction from "../components/FirstInstructions";
import SecondInstructions from "../components/SecondInstructions";

const { width, height } = Dimensions.get("window");

export default function OnboardingSwiper({ navigation }) {
  return (
    <Swiper
      loop={false}
      showsPagination={true}
      activeDotColor="#438e6c"
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
    >
      <View style={styles.slide}>
        <HomeScreen navigation={navigation} />
      </View>
      <View style={styles.slide}>
        <FirstInstruction navigation={navigation} />
      </View>
      <View style={styles.slide}>
        <SecondInstructions navigation={navigation} />
      </View>
    </Swiper>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    width,
    height,
  },
  dot: {
    backgroundColor: "#ccc",
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  activeDot: {
    backgroundColor: "#438e6c",
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 3,
  },
});
