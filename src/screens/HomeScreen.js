import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useIsFocused } from "@react-navigation/native";

export default function HomeScreen() {
  const isFocused = useIsFocused();
  const [userData, setUserData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Select");
  const [customCategory, setCustomCategory] = useState("");
  const [categoryValue, setCategoryValue] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(0);
  const [editingProfession, setEditingProfession] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [newProfession, setNewProfession] = useState("");
  const [newBudget, setNewBudget] = useState("");

  useEffect(() => {
    if (isFocused) fetchUserData();
  }, [isFocused]);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setUserData(data);
      setNewProfession(data.profession);
      setNewBudget(data.monthlyBudget.toString());
      setBudget(parseFloat(data.monthlyBudget));
      const allocations = Object.entries(data.spendingAllocation || {}).map(
        ([category, amount]) => ({ category, amount: parseFloat(amount) })
      );
      setExpenses(allocations);
    }
  };

  const handleAddExpense = async () => {
    let category =
      selectedCategory === "Custom" ? customCategory.trim() : selectedCategory;

    if (!category || !categoryValue) {
      Alert.alert("Error", "Please select or enter a category and value.");
      return;
    }

    const amount = parseFloat(categoryValue);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    const total = expenses.reduce((sum, e) => sum + e.amount, 0) + amount;
    if (total > budget) {
      Alert.alert("Error", "Total allocation exceeds monthly budget.");
      return;
    }

    const newExpenses = [...expenses, { category, amount }];
    setExpenses(newExpenses);
    setSelectedCategory("Select");
    setCustomCategory("");
    setCategoryValue("");
    await saveToFirestore(newExpenses);
  };

  const handleUpdateExpense = async (index, value) => {
    const amount = parseFloat(value);
    if (value === "") {
      const updated = [...expenses];
      updated[index].amount = "";
      setExpenses(updated);
      return;
    }
    if (isNaN(amount)) return;

    const totalWithoutCurrent = expenses.reduce(
      (sum, e, i) => (i !== index ? sum + e.amount : sum),
      0
    );
    if (totalWithoutCurrent + amount > budget) {
      Alert.alert("Error", "Total allocation exceeds monthly budget.");
      return;
    }

    const updated = [...expenses];
    updated[index].amount = amount;
    setExpenses(updated);
    await saveToFirestore(updated);
  };

  const handleRemoveExpense = async (index) => {
    const updated = [...expenses];
    updated.splice(index, 1);
    setExpenses(updated);
    await saveToFirestore(updated);
  };

  const saveToFirestore = async (updatedExpenses) => {
    const user = auth.currentUser;
    if (!user) return;

    const spendingAllocation = {};
    updatedExpenses.forEach((item) => {
      if (!isNaN(item.amount) && item.amount !== "") {
        spendingAllocation[item.category] = item.amount;
      }
    });

    await updateDoc(doc(db, "users", user.uid), { spendingAllocation });
  };

  const handleUpdateProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const updatedData = {
      profession: newProfession,
      monthlyBudget: newBudget,
    };

    await updateDoc(doc(db, "users", user.uid), updatedData);
    setEditingProfession(false);
    setEditingBudget(false);
    fetchUserData();
  };

  const getPercentage = (amount) => {
    if (!budget || !amount || isNaN(amount)) return "0.0";
    return ((amount / budget) * 100).toFixed(1);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {userData && (
          <View style={styles.block}>
            <Text style={styles.sectionTitle}>👤 Profile Overview</Text>

            <View style={styles.row}>
              <Text style={styles.detail}>
                Profession: {userData.profession}
              </Text>
              <TouchableOpacity onPress={() => setEditingProfession(true)}>
                <Text style={styles.edit}>Edit</Text>
              </TouchableOpacity>
            </View>
            {editingProfession && (
              <Picker
                selectedValue={newProfession}
                onValueChange={setNewProfession}
                style={styles.picker}
              >
                <Picker.Item label="Select Profession" value="" />
                <Picker.Item label="No Job" value="No Job" />
                <Picker.Item label="Student" value="Student" />
                <Picker.Item
                  label="Part-time Worker"
                  value="Part-time Worker"
                />
                <Picker.Item
                  label="Full-time Worker"
                  value="Full-time Worker"
                />
              </Picker>
            )}

            <View style={styles.row}>
              <Text style={styles.detail}>Monthly Budget: ${budget}</Text>
              <TouchableOpacity onPress={() => setEditingBudget(true)}>
                <Text style={styles.edit}>Edit</Text>
              </TouchableOpacity>
            </View>
            {editingBudget && (
              <TextInput
                value={newBudget}
                onChangeText={setNewBudget}
                placeholder="Enter new budget"
                keyboardType="numeric"
                style={styles.input}
                onSubmitEditing={handleUpdateProfile}
              />
            )}
          </View>
        )}

        <View style={styles.block}>
          <Text style={styles.sectionTitle}>💸 Spending Allocation</Text>
          <FlatList
            data={expenses}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.expenseRow}>
                <Text style={styles.detail}>
                  {item.category}: {getPercentage(item.amount)}% (${item.amount}
                  )
                </Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  value={item.amount.toString()}
                  onChangeText={(value) => handleUpdateExpense(index, value)}
                />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveExpense(index)}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        <View style={styles.block}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select an Expense" value="Select" />
            <Picker.Item label="Food" value="Food" />
            <Picker.Item label="Rent" value="Rent" />
            <Picker.Item label="Entertainment" value="Entertainment" />
            <Picker.Item label="Custom" value="Custom" />
          </Picker>

          {selectedCategory === "Custom" && (
            <TextInput
              style={styles.input}
              placeholder="Enter custom category"
              value={customCategory}
              onChangeText={setCustomCategory}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={categoryValue}
            onChangeText={setCategoryValue}
          />

          <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  block: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    margin: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detail: {
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  edit: {
    color: "#007bff",
    fontSize: 15,
  },
  picker: {
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    marginVertical: 6,
    borderRadius: 5,
    fontSize: 15,
  },
  expenseRow: {
    marginBottom: 10,
  },
  amountInput: {
    backgroundColor: "#f0f0f0",
    padding: 6,
    marginTop: 4,
    borderRadius: 5,
    fontSize: 15,
    width: "50%",
  },
  removeBtn: {
    backgroundColor: "#dc3545",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  removeText: {
    color: "#fff",
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 15,
  },
  chatbotText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
});
