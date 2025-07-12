import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppTabs from "./navigation/AppTabs";
import HomeScreen from "./components/Homescreen";
import FirstInstruction from "./components/FirstInstructions";
import SecondInstructions from "./components/SecondInstructions";
import OnboardingSwiper from "./navigation/OnboardingSwiper";
// function Login() {
//   const [session, setSession] = useState<Session | null>(null);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//     });

//     supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//     });
//   }, []);

//   return (
//     <View>
//       {session && session.user ? (
//         <Account key={session.user.id} session={session} />
//       ) : (
//         <Auth />
//       )}
//     </View>
//   );
// }
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingSwiper} />
          <Stack.Screen name="Main" component={AppTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
