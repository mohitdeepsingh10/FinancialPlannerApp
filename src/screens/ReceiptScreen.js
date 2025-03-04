import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ReceiptScreen() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState(null);
  const [camera, setCamera] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [cameraType, setCameraType] = useState(Camera.Constants?.Type?.back);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } =
        await ExpoCamera.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } =
        await MediaLibrary.requestPermissionsAsync();

      setHasCameraPermission(cameraStatus === "granted");
      setHasMediaLibraryPermission(mediaLibraryStatus === "granted");

      if (cameraStatus !== "granted" || mediaLibraryStatus !== "granted") {
        Alert.alert(
          "Permissions Required",
          "Camera and media permissions are needed."
        );
      }

      loadReceipts();
    })();
  }, []);

  const takePicture = async () => {
    if (camera) {
      const photo = await camera.takePictureAsync();
      setPhoto(photo.uri);
    }
  };

  const saveReceipt = async () => {
    if (!photo) {
      Alert.alert("No photo taken", "Please take a picture first.");
      return;
    }

    const newReceipts = [...receipts, photo];
    setReceipts(newReceipts);

    await AsyncStorage.setItem("receipts", JSON.stringify(newReceipts));
    setPhoto(null);
    Alert.alert("Saved", "Receipt saved successfully.");
  };

  const loadReceipts = async () => {
    const storedReceipts = await AsyncStorage.getItem("receipts");
    if (storedReceipts) {
      setReceipts(JSON.parse(storedReceipts));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📸 Receipt Storage</Text>

      {photo ? (
        <>
          <Image source={{ uri: photo }} style={styles.preview} />
          <Button mode="contained" onPress={saveReceipt} style={styles.button}>
            Save Receipt
          </Button>
        </>
      ) : hasCameraPermission === null ? (
        <Text>Requesting Camera Permission...</Text>
      ) : hasCameraPermission === false ? (
        <Text>No access to camera</Text>
      ) : (
        <Camera
          ref={(ref) => setCamera(ref)}
          style={styles.camera}
          type={cameraType}
        />
      )}

      <Button mode="contained" onPress={takePicture} style={styles.button}>
        Take Picture
      </Button>

      <Text style={styles.subTitle}>Saved Receipts:</Text>
      <FlatList
        data={receipts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.receiptImage} />
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
    marginBottom: 10,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  camera: {
    height: 300,
    borderRadius: 10,
  },
  preview: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  receiptImage: {
    width: 100,
    height: 100,
    margin: 5,
  },
  button: {
    marginTop: 10,
  },
});
