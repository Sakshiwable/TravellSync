// src/pages/ProfilePage.jsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Edit, LogOut, Users, MapPin, Calendar } from "lucide-react";

const API_URL = "http://localhost:4000/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in!");
        navigate("/");
        return;
      }

      const res = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Accept either { user } or flat user object responses
      const userData = res.data.user || res.data;
      setUser(userData);
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to load profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.success("Logged out");
    navigate("/");
  };

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-cyan-50 to-teal-50">
        <p className="text-teal-700 font-semibold">Loading profile...</p>
      </div>
    );

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "—";
  const lastActive = user.updatedAt
    ? new Date(user.updatedAt).toLocaleString()
    : "—";
  const groupsCount = Array.isArray(user.groups)
    ? user.groups.length
    : user.groupsCount ?? "—";

  return (
    <div className=" w-screen b text-slate-800">
   
      <main className="max-w-6xl mx-auto px-6 py-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36 }}
          className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-cyan-100"
        >
          {/* Top decorative header */}
          <div className="h-36 bg-gradient-to-r from-teal-500 to-cyan-500 p-6">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 rounded-full bg-white/20 ring-4 ring-white flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>

                <div className="text-white">
                  <h1 className="text-2xl font-extrabold leading-tight">
                    {user.name || "Unknown User"}
                  </h1>
                  <p className="text-sm opacity-90 mt-1">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white border border-white/10 hover:brightness-110 transition"
                >
                  <Edit size={16} /> Edit
                </button>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-teal-700 hover:bg-white/90 transition shadow-sm"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8">
            {/* Left: Profile card */}
            <div className="md:col-span-1 bg-white rounded-xl border border-cyan-50 shadow-sm p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={
                    user.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
                  }
                  alt="avatar"
                  className="w-28 h-28 rounded-full mb-4 ring-4 ring-cyan-50 object-cover"
                />
                <h2 className="text-lg font-semibold text-teal-700">
                  {user.name || "Unknown"}
                </h2>
                <p className="text-sm text-slate-600 mt-1">{user.email}</p>

                <div className="mt-6 w-full grid grid-cols-3 gap-3">
                  <div className="py-3 px-2 rounded-lg bg-gradient-to-tr from-cyan-50 to-teal-50 text-center">
                    <div className="text-sm text-teal-700 font-semibold">
                      {groupsCount}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Groups</div>
                  </div>

                  <div className="py-3 px-2 rounded-lg bg-cyan-50 text-center">
                    <div className="text-sm text-teal-700 font-semibold">—</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Live Shares
                    </div>
                  </div>

                  <div className="py-3 px-2 rounded-lg bg-teal-50 text-center">
                    <div className="text-sm text-teal-900 font-semibold">—</div>
                    <div className="text-xs text-slate-500 mt-1">Friends</div>
                  </div>
                </div>

                <div className="mt-6 w-full">
                  <button
                    onClick={() => navigate("/friends")}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold"
                  >
                    <Users size={14} /> View Friends
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-cyan-50 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-teal-700 mb-3">
                  Account details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Joined</div>
                      <div className="font-medium text-slate-800">{joined}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">
                        Default location
                      </div>
                      <div className="font-medium text-slate-800">
                        {user.defaultLocation || "Not set"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Groups</div>
                      <div className="font-medium text-slate-800">
                        {groupsCount}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Last active</div>
                      <div className="font-medium text-slate-800">
                        {lastActive}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-cyan-50 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-md font-semibold text-teal-700">
                    Privacy & sharing
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Control how and when your location is shared with groups.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/settings")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-cyan-100 text-teal-700 hover:bg-cyan-50 transition"
                  >
                    Manage settings
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(user.email || "");
                      toast.success("Email copied");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white"
                  >
                    Copy email
                  </button>
                </div>
              </div>

              <div className="text-sm text-slate-500">
                Need more help? Contact support at{" "}
                <span className="font-medium text-slate-800">
                  {import.meta.env.VITE_SUPPORT_EMAIL ||
                    "support@travelsync.app"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
