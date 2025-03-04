import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./src/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import DashboardScreen from "./src/screens/DashboardScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import CurrencyScreen from "./src/screens/CurrencyScreen";
import MapsScreen from "./src/screens/MapsScreen";
import MapsSelectionScreen from "./src/screens/MapsSelectionScreen";
import ReceiptScreen from "./src/screens/ReceiptScreen";
import RecipeScreen from "./src/screens/RecipeScreen";
import HomeScreen from "./src/screens/HomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: user.email,
            profession: "",
            monthlyBudget: "",
            spendingAllocation: { food: "", rent: "", leisure: "" },
          });

          setIsNewUser(true);
        } else {
          setIsNewUser(false);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{ title: "Sign In" }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ title: "Sign Up" }}
            />
          </>
        ) : isNewUser ? (
          <>
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ title: "Set Up Your Budget" }}
            />
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: "Settings" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: "Settings" }}
            />
            <Stack.Screen
              name="Currency"
              component={CurrencyScreen}
              options={{ title: "Currency Exchange" }}
            />
            <Stack.Screen
              name="MapsSelection"
              component={MapsSelectionScreen}
              options={{ title: "Find Nearby Places" }}
            />
            <Stack.Screen
              name="MapsScreen"
              component={MapsScreen}
              options={{ title: "Maps" }}
            />
            <Stack.Screen
              name="Receipts"
              component={ReceiptScreen}
              options={{ title: "Receipt Storage" }}
            />
            <Stack.Screen
              name="Recipes"
              component={RecipeScreen}
              options={{ title: "Recipes" }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "Home" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
