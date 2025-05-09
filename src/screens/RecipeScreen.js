import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_KEY = "0662e3549320485598e1914cf40203e9";

export default function RecipeScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const stored = await AsyncStorage.getItem("favorites");
    if (stored) setFavorites(JSON.parse(stored));
  };

  const saveFavorites = async (data) => {
    setFavorites(data);
    await AsyncStorage.setItem("favorites", JSON.stringify(data));
  };

  const handleSearch = async () => {
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: true });
    setSelectedRecipe(null);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=${query}&instructionsRequired=true&number=10&apiKey=${API_KEY}`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch recipes");
    }
  };

  const fetchRecipeDetails = async (id) => {
    try {
      const res = await fetch(
        `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${API_KEY}`
      );
      const data = await res.json();
      setSelectedRecipe(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch recipe details");
    }
  };

  const handleAddFavorite = (recipe) => {
    if (favorites.find((f) => f.id === recipe.id)) {
      Alert.alert("Already Saved", "This recipe is already in favorites.");
      return;
    }
    const updated = [...favorites, { id: recipe.id, title: recipe.title }];
    saveFavorites(updated);
    Alert.alert("Saved", "Recipe added to favorites.");
  };

  const handleRemoveFavorite = (id) => {
    const updated = favorites.filter((f) => f.id !== id);
    saveFavorites(updated);
  };

  const handleFavoriteClick = (recipe) => {
    fetchRecipeDetails(recipe.id);
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: true });
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSelectedRecipe(null);
  };

  return (
    <ScrollView style={[styles.screen, { paddingBottom: 30 }]} ref={scrollRef}>
      <View style={styles.searchContainer}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Type recipe name"
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {selectedRecipe ? (
        <View style={styles.recipeContainer}>
          <Image source={{ uri: selectedRecipe.image }} style={styles.image} />
          <Text style={styles.title}>{selectedRecipe.title}</Text>

          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => handleAddFavorite(selectedRecipe)}
          >
            <Text style={styles.favText}>+ Add to Favorites</Text>
          </TouchableOpacity>

          <Text style={styles.section}>🧂 Ingredients:</Text>
          {selectedRecipe.extendedIngredients?.map((ing, i) => (
            <Text key={i} style={styles.textItem}>
              • {ing.original}
            </Text>
          ))}

          <Text style={styles.section}>📖 Instructions:</Text>
          <Text style={styles.textItem}>
            {selectedRecipe.instructions
              ? selectedRecipe.instructions.replace(/<[^>]+>/g, "")
              : "No instructions found."}
          </Text>
        </View>
      ) : results.length > 0 ? (
        results.map((r) => (
          <TouchableOpacity
            key={r.id}
            onPress={() => handleFavoriteClick(r)}
            style={styles.resultBox}
          >
            <Image source={{ uri: r.image }} style={styles.thumb} />
            <Text style={styles.resultTitle}>{r.title}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <>
          <Text style={styles.section}>💾 Saved Favorites</Text>
          {favorites.length === 0 && (
            <Text style={styles.textItem}>No favorites yet.</Text>
          )}
          {favorites.map((f, i) => (
            <View key={f.id} style={styles.favItem}>
              <TouchableOpacity
                style={styles.favTextBox}
                onPress={() => handleFavoriteClick(f)}
              >
                <Text style={styles.favItemText}>
                  {i + 1}. {f.title}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemoveFavorite(f.id)}>
                <Text style={styles.removeBtn}>❌</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 15,
    paddingBottom: 30,
    backgroundColor: "#fff",
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 5,
  },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  clearBtn: {
    backgroundColor: "gray",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  recipeContainer: {
    marginTop: 10,
  },
  image: {
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  section: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "bold",
  },
  textItem: {
    fontSize: 15,
    marginTop: 5,
    color: "#333",
  },
  resultBox: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  resultTitle: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "600",
  },
  thumb: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  favBtn: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  favText: {
    color: "#fff",
    fontWeight: "bold",
  },
  favItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
  },
  favTextBox: {
    flex: 1,
  },
  favItemText: {
    fontSize: 16,
    color: "#333",
  },
  removeBtn: {
    fontSize: 18,
    marginLeft: 10,
  },
});
