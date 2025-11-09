// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Users,
  Map,
  Mail,
  UserPlus,
  Compass,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:4000/api";

export default function Dashboard() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/auth");
    else fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (err) {
      toast.error("Failed to load user profile");
      console.error("Error fetching profile:", err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("You’ve been logged out!");
    navigate("/auth");
  };

  const dashboardOptions = [
    {
      title: "Your Groups",
      icon: Compass,
      description: "View and manage all your travel groups.",
      path: "/groups",
    },
    {
      title: "Create Group",
      icon: UserPlus,
      description: "Start a new travel group with friends.",
      path: "/create-group",
    },
    {
      title: "Invites",
      icon: Mail,
      description: "See your pending and accepted group invites.",
      path: "/invites",
    },
    {
      title: "Friends",
      icon: Users,
      description: "Manage your friend list and send invites.",
      path: "/friends",
    },
    {
      title: "Invite Friends",
      icon: Mail,
      description: "Send an invite to your friends to join your group.",
      path: "/invite-friend",
    },
    {
      title: "Live Map",
      icon: Map,
      description: "Track your group in real-time on the map.",
      path: "/live-map",
    },
  ];

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
      {/* Navbar */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 drop-shadow-md">
            Welcome, {user?.name || "Traveler"} 🚀
          </h1>
          <p className="mt-3 text-gray-300 max-w-xl">
            Plan adventures, track your friends live, and explore the world — all in one seamless experience.
          </p>
        </div>

        {/* Dashboard Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
          {dashboardOptions.map(({ title, description, icon: Icon, path }) => (
            <div
              key={title}
              onClick={() => navigate(path)}
              className="relative overflow-hidden group bg-[#1e293b]/80 border border-blue-800/30 rounded-2xl shadow-lg hover:shadow-blue-500/30 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition bg-gradient-to-r from-blue-400 to-cyan-400"></div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-4 rounded-full shadow-md group-hover:scale-110 transform transition-all duration-300">
                  <Icon size={28} className="text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white group-hover:text-cyan-300 transition">
                  {title}
                </h2>
                <p className="text-sm text-gray-400">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
