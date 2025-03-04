import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import HomeScreen from "./HomeScreen";
import RecipeScreen from "./RecipeScreen";
import MapsScreen from "./MapsScreen";
import MapsSelectionScreen from "./MapsSelectionScreen";
import CurrencyScreen from "./CurrencyScreen";
import ReceiptScreen from "./ReceiptScreen";
import SettingsScreen from "./SettingsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MapsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MapsSelection"
        component={MapsSelectionScreen}
        options={{ title: "Find Places" }}
      />
      <Stack.Screen
        name="MapsScreen"
        component={MapsScreen}
        options={{ title: "Map" }}
      />
    </Stack.Navigator>
  );
}

export default function DashboardScreen({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 15 }}
            onPress={() => navigation.navigate("Settings")}
          >
            <MaterialIcons name="settings" size={28} color="black" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Recipes"
        component={RecipeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="restaurant-menu" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Maps"
        component={MapsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Currency"
        component={CurrencyScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="attach-money" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Receipts"
        component={ReceiptScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="receipt" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
