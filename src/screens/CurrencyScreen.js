import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import axios from "axios";

const API_KEY = "fca_live_BrO6fODd7isrGLAzrUe7pyI6UxD1F1mbuxX0z5kM";
const API_URL = `https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}`;
const currencyCountryMap = {
  USD: "United States",
  CAD: "Canada",
  EUR: "European Union",
  GBP: "United Kingdom",
  AUD: "Australia",
  JPY: "Japan",
  INR: "India",
  CNY: "China",
  MXN: "Mexico",
  BRL: "Brazil",
  ZAR: "South Africa",
  CHF: "Switzerland",
  SGD: "Singapore",
  NZD: "New Zealand",
  HKD: "Hong Kong",
  SEK: "Sweden",
  NOK: "Norway",
  KRW: "South Korea",
  RUB: "Russia",
  MYR: "Malaysia",
  IDR: "Indonesia",
  PHP: "Philippines",
  THB: "Thailand",
  SAR: "Saudi Arabia",
  AED: "United Arab Emirates",
};

export default function CurrencyScreen() {
  const [exchangeRates, setExchangeRates] = useState({});
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("CAD");
  const [convertedAmount, setConvertedAmount] = useState(null);

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get(API_URL);
      setExchangeRates(response.data.data);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      Alert.alert("Error", "Failed to fetch exchange rates.");
    }
  };

  const convertCurrency = () => {
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      Alert.alert("Error", "Invalid currency selected.");
      return;
    }

    const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
    setConvertedAmount((parseFloat(amount) * rate).toFixed(2));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💱 Currency Exchange</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
        />
      </View>

      <View style={styles.dropdownContainer}>
        <TextInput
          style={styles.currencyInput}
          value={fromCurrency}
          onChangeText={setFromCurrency}
          placeholder="From (e.g., USD)"
        />
        <Text style={styles.arrow}>➡️</Text>
        <TextInput
          style={styles.currencyInput}
          value={toCurrency}
          onChangeText={setToCurrency}
          placeholder="To (e.g., CAD)"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={convertCurrency}>
        <Text style={styles.buttonText}>Convert</Text>
      </TouchableOpacity>

      {convertedAmount !== null && (
        <Text style={styles.result}>
          {amount} {fromCurrency} = {convertedAmount} {toCurrency}
        </Text>
      )}

      <FlatList
        data={Object.keys(exchangeRates)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.rateItem}>
            <Text style={styles.currencyCode}>
              {item} ({currencyCountryMap[item] || "Unknown"})
            </Text>
            <Text style={styles.rate}>
              1 {fromCurrency} = {exchangeRates[item].toFixed(2)} {item}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    fontSize: 18,
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  currencyInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    width: "40%",
    fontSize: 18,
    textAlign: "center",
  },
  arrow: {
    fontSize: 24,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  result: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
    textAlign: "center",
  },
  rateItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 5,
    borderRadius: 5,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: "bold",
  },
  rate: {
    fontSize: 16,
    color: "#555",
  },
});
