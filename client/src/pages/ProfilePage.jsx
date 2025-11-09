// src/pages/ProfilePage.jsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:4000/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in!");
        return;
      }

      const res = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Profile API Response:", res.data);

      // ✅ Automatically handle both structures
      const userData = res.data.user || res.data;
      setUser(userData);
    } catch (err) {
      console.error("Error fetching profile:", err.message);
      toast.error("Failed to load profile");
    }
  };

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <p className="text-blue-700 font-semibold">Loading profile...</p>
      </div>
    );

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <Navbar />

      <main className="flex-1 px-6 py-16 flex flex-col items-center text-center">
        <div className="bg-white/80 border border-blue-100 rounded-2xl shadow-md p-8 max-w-md w-full">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
            alt="avatar"
            className="h-24 w-24 rounded-full mx-auto mb-4 ring-4 ring-blue-200"
          />
          <h1 className="text-2xl font-bold text-blue-800">
            {user.name || "Unknown User"}
          </h1>
          <p className="text-blue-600 mt-1">{user.email}</p>

          <div className="mt-6 text-left">
            <h3 className="text-sm font-semibold text-blue-700 mb-2">
              Account Info
            </h3>
            {/* <p className="text-sm text-gray-600">User ID: {user._id}</p> */}
            <p className="text-sm text-gray-600 mt-1">
              Joined on: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
