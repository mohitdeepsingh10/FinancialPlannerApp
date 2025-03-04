import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function OnboardingScreen({ navigation }) {
  const [profession, setProfession] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState(1000);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [allocation, setAllocation] = useState({});
  const [remainingPercentage, setRemainingPercentage] = useState(100);

  const expenseOptions = [
    "Select an Expense",
    "Food",
    "Rent",
    "Utilities",
    "Entertainment",
    "Transport",
    "Custom",
  ];

  const addExpense = () => {
    if (
      !expenseType ||
      expenseType === "Select an Expense" ||
      (expenseType === "Custom" && !newExpense)
    ) {
      Alert.alert("Error", "Please select or enter an expense category.");
      return;
    }

    const expenseName = expenseType === "Custom" ? newExpense : expenseType;

    if (selectedExpenses.includes(expenseName)) {
      Alert.alert("Error", "Expense already added.");
      return;
    }

    setSelectedExpenses([...selectedExpenses, expenseName]);
    setAllocation({ ...allocation, [expenseName]: 0 });
    setExpenseType("");
    setNewExpense("");
  };

  const removeExpense = (expense) => {
    const updatedExpenses = selectedExpenses.filter((e) => e !== expense);
    const { [expense]: _, ...updatedAllocation } = allocation;

    const totalAllocated = Object.values(updatedAllocation).reduce(
      (a, b) => a + b,
      0
    );
    setRemainingPercentage(100 - totalAllocated);

    setSelectedExpenses(updatedExpenses);
    setAllocation(updatedAllocation);
  };

  const updateAllocation = (expense, value) => {
    const totalAllocated = Object.values({
      ...allocation,
      [expense]: value,
    }).reduce((a, b) => a + b, 0);
    if (totalAllocated > 100) {
      Alert.alert("Error", "Total allocation exceeds 100%.");
      return;
    }

    setAllocation({ ...allocation, [expense]: value });
    setRemainingPercentage(100 - totalAllocated);
  };

  const saveUserData = async () => {
    if (remainingPercentage > 0) {
      Alert.alert("Error", `${remainingPercentage}% not allocated yet.`);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "No user logged in.");
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid), {
        profession,
        monthlyBudget,
        spendingAllocation: allocation,
      });

      Alert.alert("Success", "Your budget plan has been saved.");

      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "Failed to save data.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Your Budget Planner</Text>

        <Text style={styles.label}>What is your profession?</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={profession}
            onValueChange={(itemValue) => setProfession(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Profession" value="" />
            <Picker.Item label="Student" value="Student" />
            <Picker.Item label="Part-time Worker" value="Part-time Worker" />
            <Picker.Item label="Full-time Worker" value="Full-time Worker" />
            <Picker.Item label="Self-Employed" value="Self-Employed" />
            <Picker.Item label="Unemployed" value="Unemployed" />
            <Picker.Item label="Retired" value="Retired" />
          </Picker>
        </View>

        <Text style={styles.label}>What is your monthly budget?</Text>
        <Text style={styles.budgetText}>${monthlyBudget}</Text>
        <Slider
          style={styles.slider}
          minimumValue={100}
          maximumValue={10000}
          step={50}
          value={monthlyBudget}
          onValueChange={(value) => setMonthlyBudget(value)}
        />

        <Text style={styles.label}>Select or Add Expense Categories:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={expenseType}
            onValueChange={(itemValue) => setExpenseType(itemValue)}
            style={styles.picker}
          >
            {expenseOptions.map((option, index) => (
              <Picker.Item key={index} label={option} value={option} />
            ))}
          </Picker>
        </View>
        {expenseType === "Custom" && (
          <TextInput
            style={styles.input}
            placeholder="Enter custom expense"
            value={newExpense}
            onChangeText={setNewExpense}
          />
        )}
        <TouchableOpacity style={styles.addButton} onPress={addExpense}>
          <Text style={styles.buttonText}>+ Add Expense</Text>
        </TouchableOpacity>

        <Text style={styles.label}>
          Allocate Your Budget (Remaining: {remainingPercentage}%)
        </Text>
        {selectedExpenses.map((expense, index) => (
          <View key={index} style={styles.allocationItem}>
            <Text style={styles.allocationLabel}>
              {expense} - $
              {((allocation[expense] / 100) * monthlyBudget).toFixed(2)}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={allocation[expense] || 0}
              onValueChange={(value) => updateAllocation(expense, value)}
            />
            <Text>{allocation[expense]}%</Text>
            <TouchableOpacity
              onPress={() => removeExpense(expense)}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={saveUserData}>
          <Text style={styles.buttonText}>Save & Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 5,
    width: "90%",
    marginVertical: 8,
  },
  picker: { width: "100%", height: 50 },
  budgetText: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
  slider: { width: "90%", height: 40 },
  allocationItem: {
    width: "90%",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#ddd",
    borderRadius: 5,
    alignItems: "center",
  },
  allocationLabel: { fontSize: 16, fontWeight: "bold" },
  removeButton: {
    marginTop: 5,
    backgroundColor: "red",
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: { color: "#fff", fontSize: 14 },
  button: {
    width: "90%",
    padding: 15,
    marginTop: 20,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
  },
  addButton: {
    width: "90%",
    padding: 18,
    marginTop: 10,
    backgroundColor: "#28a745",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
