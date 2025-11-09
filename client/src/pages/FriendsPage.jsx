// src/pages/FriendsPage.jsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:4000/api";

export default function FriendsPage() {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/friends/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriends(res.data.friends || []);
    } catch (err) {
      toast.error("Failed to load friends");
      console.error("Error fetching friends:", err.message);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <Navbar />

      <main className="flex-1 px-6 py-16 flex flex-col items-center text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">👥 Your Friends</h1>
        <p className="text-blue-600 mb-10">View your friends and online status.</p>

        {friends.length === 0 ? (
          <div className="text-gray-500 bg-white/70 border border-blue-100 px-6 py-10 rounded-2xl shadow-sm">
            You have no friends added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
            {friends.map((f) => (
              <div
                key={f._id}
                className="bg-white/80 border border-blue-100 rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
                  alt="avatar"
                  className="h-14 w-14 rounded-full mb-3 ring-2 ring-blue-200"
                />
                <h3 className="font-semibold text-blue-800">{f.name}</h3>
                <p className="text-sm text-blue-500">{f.email}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
