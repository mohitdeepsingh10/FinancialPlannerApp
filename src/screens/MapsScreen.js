import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import "react-native-get-random-values";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import * as Location from "expo-location";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = 

export default function MapsScreen({ route }) {
  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const { type } = route.params || { type: "custom" };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
      setLoading(false);

      if (type !== "custom") {
        fetchNearbyPlaces(userLocation.coords, type);
      }
    })();
  }, []);

  const fetchNearbyPlaces = async (coords, placeType) => {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.latitude},${coords.longitude}&radius=5000&type=${placeType}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await axios.get(url);
      setPlaces(response.data.results);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  return (
    <View style={styles.container}>
      {}
      {type === "custom" && (
        <GooglePlacesAutocomplete
          placeholder="Search for places"
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (details) {
              setDestination({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              });
            }
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: "en",
            location: location
              ? `${location.latitude},${location.longitude}`
              : "",
            radius: 15000,
            components: "country:CA",
          }}
          styles={{
            container: {
              position: "absolute",
              top: 10,
              width: "90%",
              alignSelf: "center",
              zIndex: 1,
            },
            textInput: {
              height: 40,
              borderRadius: 5,
              paddingLeft: 10,
              backgroundColor: "#fff",
            },
          }}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {}
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Location"
            description="You are here"
          />

          {}
          {places.map((place, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              }}
              title={place.name}
              description={place.vicinity}
              pinColor="green"
              onPress={() =>
                setDestination({
                  latitude: place.geometry.location.lat,
                  longitude: place.geometry.location.lng,
                })
              }
            />
          ))}

          {}
          {destination && (
            <MapViewDirections
              origin={location}
              destination={destination}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={3}
              strokeColor="blue"
            />
          )}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
