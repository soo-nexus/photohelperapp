import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppTabs from "./navigation/AppTabs";
import OnboardingSwiper from "./navigation/OnboardingSwiper";
import LoginScreen from "./components/LoginPage";
import SignUpScreen from "./components/SignUpScreen";
import { supabase } from "./lib/supabase";

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Stack = createNativeStackNavigator();
function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <SafeAreaProvider
      style={{ backgroundColor: "white", borderTopColor: "white" }}
    >
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {/* Show onboarding only if you want */}
          <RootStack.Screen name="Onboarding" component={OnboardingSwiper} />
          <Stack.Screen name="Auth" component={AuthStackScreen} />
          <Stack.Screen name="Main" component={AppTabs} />
          {/* Conditionally show Auth or AppTabs */}
        </RootStack.Navigator>
        {/* <Stack.Screen name="Auth" component={AuthStackScreen} />
        <Stack.Screen name="Main" component={AppTabs} /> */}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
