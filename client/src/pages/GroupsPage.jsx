// src/pages/GroupsPage.jsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Users, Send, MapPin, Map, Crown } from "lucide-react";
import io from "socket.io-client";

const API_URL = "http://localhost:4000/api";
const SOCKET_URL = "http://localhost:4000";

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [socket, setSocket] = useState(null);
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
    const token = localStorage.getItem("token");
    const s = io(SOCKET_URL, { auth: { token } });
    setSocket(s);

    s.on("initialMessages", (msgs) => {
      setMessages(msgs || []);
      scrollToBottom();
    });

    s.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    s.on("typing", ({ userId, isTyping }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: isTyping }));
      setTimeout(() => {
        setTypingUsers((prev) => ({ ...prev, [userId]: false }));
      }, 3000);
    });

    s.on("groupMembers", (m) => setMembers(m || []));
    s.on("groupLocations", (payload) => setMembers(payload || []));

    return () => {
      s.disconnect();
    };
  }, []);

  const scrollToBottom = () =>
    setTimeout(() => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/groups/my-groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data.groups || []);
    } catch (err) {
      toast.error("Failed to load groups");
      console.error("Error fetching groups:", err.message);
    }
  };

  const openGroup = async (group) => {
    setSelectedGroup(group);
    setMessages([]);
    socket?.emit("joinGroup", { groupId: group._id });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/groups/${group._id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data.members || []);
    } catch (err) {
      console.error("Error fetching members:", err);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/groups/${group._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.messages || []);
      scrollToBottom();
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;
    socket.emit("sendMessage", { groupId: selectedGroup._id, text: newMessage });
    setNewMessage("");
  };

  const handleTyping = (val) => {
    if (!selectedGroup) return;
    socket.emit("typing", { groupId: selectedGroup._id, isTyping: val });
  };

  const shareLocation = () => {
    if (!selectedGroup) return;
    if (!navigator.geolocation) return toast.error("Geolocation not supported by your browser");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        socket.emit("shareLocation", { groupId: selectedGroup._id, lat, lng });
        toast.success("📍 Location shared successfully!");
      },
      () => toast.error("Failed to get location")
    );
  };

  const goToLiveMap = () => {
    if (!selectedGroup) return toast.error("Select a group first!");
    navigate(`/live-map?groupId=${selectedGroup._id}`);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-gray-100">
      {/* Navbar (fixed) */}
      <Navbar />

      {/* main: account for fixed navbar (h-16) and fixed footer (h-16) */}
      <main className="flex-1 flex mt-16 pt-4 pb-16">
        {/* LEFT SIDEBAR - Groups */}
        <aside className="w-1/4 bg-[#1e293b]/70 border-r border-cyan-500/30 p-4 flex flex-col min-h-0">
          <h2 className="text-lg font-bold text-cyan-300 mb-4">Your Groups</h2>

          {/* this container scrolls only if content overflows */}
          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-cyan-700/40 scrollbar-track-transparent">
            {groups.map((group) => (
              <div
                key={group._id}
                onClick={() => openGroup(group)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedGroup?._id === group._id
                    ? "bg-cyan-600/30 border border-cyan-400"
                    : "hover:bg-[#0f172a]/60 border border-transparent"
                }`}
              >
                <p className="text-cyan-200 font-semibold">{group.groupName}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin size={12} /> {group.destination || "Unknown"}
                </p>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN CHAT AREA */}
        <section className="flex-1 flex flex-col bg-[#0f172a]/70 backdrop-blur-md p-6 min-h-0">
          {!selectedGroup ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Users size={40} className="text-cyan-400 mb-3" />
              <p>Select a group to start chatting 💬</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-cyan-300">{selectedGroup.groupName}</h2>
                  <p className="text-xs text-gray-400">
                    {selectedGroup.destination || "Unknown destination"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={shareLocation}
                    className="flex items-center gap-2 px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
                  >
                    <MapPin size={16} /> Share Location
                  </button>
                  <button
                    onClick={goToLiveMap}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition"
                  >
                    <Map size={16} /> Live Map
                  </button>
                </div>
              </div>

              {/* Chat Messages — scrolls only when necessary */}
              <div className="flex-1 overflow-y-auto space-y-3 p-2 scrollbar-thin scrollbar-thumb-cyan-700/40 scrollbar-track-transparent">
                {messages.map((msg, i) => (
                  <div
                    key={msg._id || i}
                    className={`flex ${
                      msg.fromUserId?._id === localStorage.getItem("userId") ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        msg.fromUserId?._id === localStorage.getItem("userId")
                          ? "bg-cyan-600 text-white rounded-br-none"
                          : "bg-[#1e293b] text-cyan-200 rounded-bl-none"
                      }`}
                    >
                      <p className="text-xs font-semibold text-cyan-300 mb-1">
                        {msg.fromUserId?.name || msg.fromUserId?.email || "User"}
                      </p>

                      {msg.messageType === "text" && <p className="text-sm">{msg.text}</p>}

                      {msg.messageType === "location" && msg.location && (
                        <a
                          href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-300 underline"
                        >
                          📍 Shared a location
                        </a>
                      )}

                      <p className="text-[10px] text-gray-400 mt-1 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {Object.values(typingUsers).some(Boolean) && (
                  <div className="text-sm text-gray-400 italic">Someone is typing...</div>
                )}

                <div ref={messageEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="flex items-center mt-4 border-t border-cyan-500/30 pt-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-[#1e293b]/70 text-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping(true);
                    setTimeout(() => handleTyping(false), 700);
                  }}
                />
                <button
                  type="submit"
                  className="ml-3 p-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </section>

        {/* RIGHT SIDEBAR - Members */}
        {selectedGroup && (
          <aside className="w-1/4 bg-[#1e293b]/70 border-l border-cyan-500/30 p-4 flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-cyan-300 mb-4">Group Members</h2>

            <ul className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-cyan-700/40 scrollbar-track-transparent">
              {members.map((m) => (
                <li
                  key={m._id}
                  className="flex justify-between items-center bg-[#0f172a]/50 p-3 rounded-lg hover:bg-[#0f172a]/80 transition"
                >
                  <div className="flex flex-col">
                    <span className="text-gray-100 font-medium flex items-center gap-1">
                      {m.userId?.name || "Unknown"}
                      {m.role === "admin" && (
                        <Crown size={14} className="text-yellow-400" title="Admin" />
                      )}
                    </span>
                    <span className="text-xs text-gray-400">{m.userId?.email}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      m.isOnline ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {m.isOnline ? "Online" : "Offline"}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </main>

      {/* fixed footer */}
      <Footer />
    </div>
  );
}
