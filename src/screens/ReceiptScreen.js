import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function ReceiptScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    const stored = await AsyncStorage.getItem("receipts");
    if (stored) {
      setReceipts(JSON.parse(stored));
    }
  };

  const saveReceipts = async (data) => {
    setReceipts(data);
    await AsyncStorage.setItem("receipts", JSON.stringify(data));
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();
      const timestamp = new Date().toLocaleString();
      const newReceipt = { uri: photo.uri, timestamp };
      const updatedReceipts = [...receipts, newReceipt];

      await saveReceipts(updatedReceipts);
    } catch (err) {
      console.error("Camera error:", err);
      Alert.alert("Error", "Could not take picture.");
    }
  };

  const deleteReceipt = (index) => {
    Alert.alert(
      "Delete Receipt",
      "Are you sure you want to delete this receipt?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            const updated = [...receipts];
            updated.splice(index, 1);
            await saveReceipts(updated);
          },
          style: "destructive",
        },
      ]
    );
  };

  if (!cameraPermission?.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          Camera access is required to use this feature.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestCameraPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📸 Receipt Storage</Text>

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        enableTorch={false}
      />

      <TouchableOpacity style={styles.button} onPress={takePicture}>
        <Text style={styles.buttonText}>Take Picture</Text>
      </TouchableOpacity>

      <Text style={styles.subTitle}>Saved Receipts:</Text>
      <FlatList
        data={receipts}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.receiptRow}>
            <TouchableOpacity
              style={styles.receiptButton}
              onPress={() => setSelectedReceipt(item)}
            >
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteReceipt(index)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal to show image when a receipt is selected */}
      <Modal visible={!!selectedReceipt} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Image
            source={{ uri: selectedReceipt?.uri }}
            style={styles.modalImage}
          />
          <TouchableOpacity
            onPress={() => setSelectedReceipt(null)}
            style={styles.closeModal}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  camera: {
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  receiptButton: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 6,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 8,
  },
  deleteText: {
    color: "#ff4444",
    fontSize: 20,
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 14,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalImage: {
    width: "90%",
    height: "70%",
    borderRadius: 10,
  },
  closeModal: {
    marginTop: 20,
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
  },
});
