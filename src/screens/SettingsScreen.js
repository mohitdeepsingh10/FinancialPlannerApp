import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Button, Divider } from "react-native-paper";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { CommonActions } from "@react-navigation/native";

export default function SettingsScreen({ navigation }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "SignIn" }],
        })
      );
    } catch (error) {
      Alert.alert("Error", "Logout failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>
      <Divider style={styles.divider} />
      <View style={styles.option}>
        <Text style={styles.label}>👤 My Account</Text>
        <Text style={styles.text}>
          {auth.currentUser?.email || "No email found"}
        </Text>
      </View>
      <View style={styles.option}>
        <Text style={styles.label}>🔧 Account Settings</Text>
        <Text style={styles.text}>Coming Soon...</Text>
      </View>
      <View style={styles.option}>
        <Text style={styles.label}>ℹ️ About Us</Text>
        <Text style={styles.text}>
          Created by Sarah Nguyen and Mohit. Financial Planner App for students.
        </Text>
      </View>
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        Log Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  divider: { marginVertical: 10 },
  option: { marginBottom: 20 },
  label: { fontSize: 18, fontWeight: "bold" },
  text: { fontSize: 16, color: "#555" },
  logoutButton: { marginTop: 20, backgroundColor: "red" },
});
