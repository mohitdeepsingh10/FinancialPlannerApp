import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function MapsSelectionScreen({ navigation }) {
  const categories = [
    { name: "🔍 Custom Search", type: "custom", color: "#ff6b6b" },
    { name: "🛒 Grocery Store", type: "supermarket", color: "#28a745" },
    { name: "💱 Currency Exchange", type: "bank", color: "#17a2b8" },
    { name: "💲 Dollar Store", type: "department_store", color: "#ffc107" },
    { name: "📚 Library", type: "library", color: "#6610f2" },
  ];

  return (
    <LinearGradient colors={["#ffffff", "#d3e9ff"]} style={styles.container}>
      <Text style={styles.title}>🌍 Find Nearby Places</Text>
      {categories.map((category, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.button, { backgroundColor: category.color }]}
          onPress={() =>
            navigation.navigate("MapsScreen", { type: category.type })
          }
        >
          <Text style={styles.buttonText}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#343a40",
    textAlign: "center",
  },
  button: {
    width: "90%",
    paddingVertical: 15,
    marginVertical: 8,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
