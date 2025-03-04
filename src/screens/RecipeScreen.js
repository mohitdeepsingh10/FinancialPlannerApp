import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RecipeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>🍽 Recipe Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
