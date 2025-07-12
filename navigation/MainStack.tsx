// navigation/MainStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../components/Homescreen";
import ExploreScreen from "../components/ExploreScreen";
import FormScreen from "../components/FormScreen";
import MapScreen from "../components/MapScreen";
import ChatScreen from "../components/ChatScreen";
import AddScreen from "../components/AddScreen";
import SearchScreen from "../components/SearchScreen";
import UserScreen from "../components/UserScreen";
import LoginScreen from "../components/LoginPage";
import SignUpScreen from "../components/SignUpScreen";
const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Explore" component={ExploreScreen} />
      <Stack.Screen name="Form" component={FormScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Add" component={AddScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="User" component={UserScreen} />
    </Stack.Navigator>
  );
}
