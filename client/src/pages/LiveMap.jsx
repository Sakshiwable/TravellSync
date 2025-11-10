// src/pages/LiveMap.jsx
import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import { MapPin } from "lucide-react";
import React from "react";

const SOCKET_URL = "http://localhost:4000";
const API_URL = "http://localhost:4000/api";

export default function LiveMap() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const groupId = params.get("groupId");
  const [socket, setSocket] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [members, setMembers] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const mapRef = useRef(null);

  const destination = { lat: 18.5204, lng: 73.8567, name: "Pune" };

  // Custom icons
  const userIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
    iconSize: [35, 35],
  });
  const friendIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [35, 35],
  });

  // 📏 Distance calculator
  const haversineDistance = (a, b) => {
    if (!a || !b) return null;
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const hav =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return R * 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
  };

  // Sort members by proximity to current user
  const sortedMembers = useMemo(() => {
    return members
      .filter((m) => m.lat && m.lng)
      .sort((a, b) => {
        if (!userLocation) return 0;
        const da = haversineDistance(userLocation, { lat: a.lat, lng: a.lng }) || 0;
        const db = haversineDistance(userLocation, { lat: b.lat, lng: b.lng }) || 0;
        return da - db;
      });
  }, [members, userLocation]);

  // 🧠 Connect to socket and join group
  useEffect(() => {
    if (!groupId) {
      toast.error("No group selected for Live Map.");
      navigate("/groups");
      return;
    }

    const token = localStorage.getItem("token");
    const s = io(SOCKET_URL, { auth: { token } });
    setSocket(s);

    s.emit("joinGroup", { groupId });

    // Receive live updates
    s.on("groupLocations", (payload) => {
      setMembers(payload || []);
    });

    s.on("groupMembers", (payload) => {
      setMembers(payload || []);
    });

    return () => {
      s.disconnect();
    };
  }, [groupId]);

  // 🛰️ Watch user's own location
  useEffect(() => {
    if (!socket) return;
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        socket.emit("locationUpdate", { groupId, lat, lng });
        if (!routeCoords.length) fetchRouteInfo(lat, lng);
      },
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [socket]);

  // 🧭 Fetch route
  const fetchRouteInfo = async (lat, lng) => {
    try {
      const res = await axios.post(`${API_URL}/route`, {
        origin: { lat, lng },
        destination,
      });
      const data = res.data;
      setRouteInfo({ distance: data.distance, duration: data.duration });
      setRouteCoords(data.coordinates);
    } catch (err) {
      console.error("Error fetching route:", err.message);
    }
  };

  // Label for names
  const NameLabel = ({ name, lat, lng }) => {
    const map = useMap();
    const labelRef = useRef(null);

    useEffect(() => {
      if (!map) return;
      const div = L.divIcon({
        html: `<div style="
          background: rgba(255,255,255,0.9);
          padding: 2px 6px;
          border-radius: 6px;
          border: 1px solid #ddd;
          color: #2563eb;
          font-size: 12px;
          font-weight: 600;
        ">${name}</div>`,
        className: "",
      });
      const marker = L.marker([lat, lng], { icon: div }).addTo(map);
      labelRef.current = marker;
      return () => {
        if (labelRef.current) map.removeLayer(labelRef.current);
      };
    }, [map, name, lat, lng]);

    return null;
  };

  // 🚀 Floating actions
  const shareMapLink = () => {
    const link = `${window.location.origin}/live-map?groupId=${groupId}`;
    navigator.clipboard.writeText(link);
    toast.success("📍 Map link copied to clipboard!");
  };

  if (!userLocation) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-cyan-300">Getting your live location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-gray-100 overflow-hidden">
  

      {/* 🧭 Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full z-40 bg-white/80 backdrop-blur-md border-l border-cyan-400/30 shadow-xl transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="p-4 border-b bg-gradient-to-r from-cyan-600 to-blue-500 text-white">
          <h3 className="font-semibold text-lg">Group Members</h3>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-60px)] space-y-2">
          {sortedMembers.map((m) => (
            <div
              key={m.userId}
              className="flex items-center gap-3 p-3 bg-white/70 hover:bg-cyan-50 rounded-xl shadow-sm border border-cyan-50 transition-all"
            >
              <div className="relative">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
                  alt="avatar"
                  className="h-10 w-10 rounded-full ring-2 ring-cyan-200"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${m.isOnline ? "bg-green-400 ring-2 ring-white" : "bg-gray-300"
                    }`}
                ></span>
              </div>
              <div>
                <div className="font-medium text-sm text-cyan-800">{m.name || "Unknown"}</div>
                {userLocation && m.lat && m.lng && (
                  <div className="text-xs text-cyan-600">
                    {haversineDistance(userLocation, { lat: m.lat, lng: m.lng }).toFixed(1)} km away
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* 🗺️ Map */}
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>

        {members
          .filter((m) => m.lat && m.lng)
          .map((m) => (
            <React.Fragment key={m.userId}>
              <Marker position={[m.lat, m.lng]} icon={friendIcon}>
                <Popup>
                  <strong>{m.name}</strong>
                  <br />
                  {m.email}
                </Popup>
              </Marker>
              <NameLabel name={m.name} lat={m.lat} lng={m.lng} />
            </React.Fragment>
          ))}


        {/* Destination marker */}
        <Marker position={[destination.lat, destination.lng]} icon={friendIcon}>
          <Popup>{destination.name}</Popup>
        </Marker>

        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="#06b6d4" weight={5} opacity={0.95} />
        )}
      </MapContainer>

      {/* Floating Action Menu */}
      <div
        className="fixed bottom-6 z-50 flex flex-col gap-3 items-end transition-all duration-300"
        style={{ right: sidebarOpen ? "21rem" : "1.5rem" }}
      >
        {actionMenuOpen && (
          <div className="flex flex-col gap-2 mb-2 transition-all duration-200">
            <button
              onClick={shareMapLink}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg flex items-center gap-2"
            >
              🔗 Share Map
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg flex items-center gap-2"
            >
              👥 Members
            </button>
            <button
              onClick={() => mapRef.current.setView([userLocation.lat, userLocation.lng], 13)}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg flex items-center gap-2"
            >
              📍 Find Me
            </button>
          </div>
        )}

        <button
          onClick={() => setActionMenuOpen((prev) => !prev)}
          className={`bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:bg-cyan-700 hover:shadow-2xl transition-transform duration-200 ${actionMenuOpen ? "rotate-45 scale-110" : ""
            }`}
        >
          <MapPin size={22} />
        </button>
      </div>

      <Footer />
    </div>
  );
}
