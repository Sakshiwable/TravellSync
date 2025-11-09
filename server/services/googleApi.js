// services/googleApi.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ORS_API_KEY = process.env.ORS_API_KEY;

// 🧭 Get route info using OpenRouteService (instead of Google)
export const getRouteInfo = async (origin, destination) => {
  try {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car`;
    const response = await axios.post(
      url,
      {
        coordinates: [
          [origin.lng, origin.lat],
          [destination.lng, destination.lat],
        ],
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const route = response.data.features[0].properties.segments[0];

    return {
      distance: (route.distance / 1000).toFixed(2) + " km",
      duration: Math.round(route.duration / 60) + " min",
      durationValue: route.duration,
    };
  } catch (error) {
    console.error("Error fetching ORS route:", error.message);
    return null;
  }
};

// 🚗 Calculate ETA
export const calculateETA = (durationValue) => {
  return Math.round(durationValue / 60);
};

// 🚦 Check if user deviated from route
export const checkRouteDeviation = (userLat, userLng, destLat, destLng) => {
  const latDiff = Math.abs(userLat - destLat);
  const lngDiff = Math.abs(userLng - destLng);
  return latDiff > 0.01 || lngDiff > 0.01;
};
