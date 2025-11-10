// src/pages/GroupsPage.jsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Users, Send, MapPin, Crown, Search, Plus, X } from "lucide-react";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

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
  const [query, setQuery] = useState("");
  const [membersOpen, setMembersOpen] = useState(false);
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  // ensure typing indicator persists at least 2s
  const typingTimersRef = useRef({});
  const typingLastRef = useRef({});

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

    // keep typing indicator for at least 2000ms per user
    s.on("typing", ({ userId, isTyping }) => {
      if (!userId) return;

      if (isTyping) {
        setTypingUsers((prev) => ({ ...prev, [userId]: true }));
        typingLastRef.current[userId] = Date.now();

        if (typingTimersRef.current[userId]) {
          clearTimeout(typingTimersRef.current[userId]);
        }
        typingTimersRef.current[userId] = setTimeout(() => {
          setTypingUsers((prev) => {
            const copy = { ...prev };
            delete copy[userId];
            return copy;
          });
          delete typingTimersRef.current[userId];
          delete typingLastRef.current[userId];
        }, 2000);
      } else {
        const last = typingLastRef.current[userId] || 0;
        const elapsed = Date.now() - last;
        const remaining = Math.max(0, 2000 - elapsed);

        if (typingTimersRef.current[userId]) {
          clearTimeout(typingTimersRef.current[userId]);
        }
        typingTimersRef.current[userId] = setTimeout(() => {
          setTypingUsers((prev) => {
            const copy = { ...prev };
            delete copy[userId];
            return copy;
          });
          delete typingTimersRef.current[userId];
          delete typingLastRef.current[userId];
        }, remaining);
      }
    });

    s.on("groupMembers", (m) => setMembers(m || []));
    s.on("groupLocations", (payload) => setMembers(payload || []));

    return () => {
      Object.values(typingTimersRef.current).forEach((t) => clearTimeout(t));
      typingTimersRef.current = {};
      typingLastRef.current = {};
      s.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = () =>
    setTimeout(
      () => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/groups/my-groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data.groups || []);
    } catch (err) {
      toast.error("Failed to load groups");
      console.error("Error fetching groups:", err?.message || err);
    }
  };

  const openGroup = async (group) => {
    setSelectedGroup(group);
    setMessages([]);
    socket?.emit("joinGroup", { groupId: group._id });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/groups/${group._id}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
    socket.emit("sendMessage", {
      groupId: selectedGroup._id,
      text: newMessage,
    });
    setNewMessage("");
  };

  const handleTyping = (val) => {
    if (!selectedGroup) return;
    socket.emit("typing", { groupId: selectedGroup._id, isTyping: val });
  };

  const shareLocation = () => {
    if (!selectedGroup) return;
    if (!navigator.geolocation)
      return toast.error("Geolocation not supported by your browser");

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

  const filtered = groups.filter((g) =>
    (g.groupName || "").toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="w-screen text-slate-800">
      <main className="max-w-7xl mx-auto flex gap-6 px-4 md:px-6 py-8 h-[calc(100vh-4rem)]">
        <aside className="w-80 flex-shrink-0 bg-white border border-cyan-100 rounded-xl shadow-sm p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-teal-700 flex items-center gap-2">
              <Users /> Groups
            </h2>
            <span className="text-sm text-slate-500">{filtered.length}</span>
          </div>

          <div className="hidden md:flex items-center bg-white border border-cyan-100 rounded-full px-3 py-2 shadow-sm mb-4">
            <Search className="text-cyan-500 mr-2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search groups..."
              className="outline-none text-sm w-full bg-transparent"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {filtered.length === 0 ? (
              <div className="text-sm text-slate-500 p-6 text-center">
                No groups found — create your first group.
              </div>
            ) : (
              filtered.map((group) => (
                <motion.div
                  key={group._id}
                  onClick={() => openGroup(group)}
                  layout
                  whileHover={{ scale: 1.01 }}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer transition-shadow ${
                    selectedGroup?._id === group._id
                      ? "bg-teal-50 shadow-md border border-teal-100"
                      : "hover:shadow hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-cyan-100 to-teal-50 flex items-center justify-center text-teal-700 font-bold text-lg">
                      {group.groupName?.slice(0, 2).toUpperCase() || "G"}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-slate-800 truncate">
                        {group.groupName}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin size={12} />
                        <span className="truncate">
                          {group.destination || "Destination not set"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-500">
                      {new Date(
                        group.updatedAt || group.createdAt
                      ).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-400">
                      {group.members?.length ?? "—"} members
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/create-group")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full shadow"
            >
              <Plus size={14} /> Create
            </button>

            <button
              type="button"
              onClick={fetchGroups}
              className="p-2 rounded-full bg-white border border-cyan-100 text-cyan-600"
              title="Refresh groups"
            >
              Refresh
            </button>
          </div>
        </aside>

        <section className="flex-1 bg-white border border-cyan-100 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-cyan-50 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800">
                {selectedGroup ? selectedGroup.groupName : "Select a group"}
              </div>
              <div className="text-xs text-slate-500">
                {selectedGroup?.destination || "No destination"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!selectedGroup)
                    return toast.error("Select a group first!");
                  setMembersOpen(true);
                }}
                className="px-3 py-2 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600 transition"
              >
                Members
              </button>

              <button
                onClick={shareLocation}
                className="px-3 py-2 bg-white border border-cyan-100 text-cyan-600 rounded-lg text-sm hover:shadow transition"
              >
                Share Your Location
              </button>

              <button
                onClick={goToLiveMap}
                className="px-3 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg text-sm hover:shadow-lg transition"
              >
                Live Map
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            {!selectedGroup ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Users size={56} className="text-cyan-500 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Select a group to open the chat
                </h3>
                <p className="text-sm text-slate-500 text-center max-w-md">
                  Choose a group from the left to view messages, share live
                  locations and coordinate with friends.
                </p>
              </div>
            ) : (
              <>
                {messages.length === 0 && (
                  <div className="text-center text-sm text-slate-500">
                    No messages yet — start the conversation!
                  </div>
                )}

                {messages.map((msg, i) => {
                  const mine =
                    msg.fromUserId?._id === localStorage.getItem("userId");
                  return (
                    <div
                      key={msg._id || i}
                      className={`flex ${
                        mine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                          mine
                            ? "bg-teal-600 text-white rounded-br-none"
                            : "bg-white border border-cyan-50 text-slate-800 rounded-bl-none"
                        }`}
                      >
                        <div className="text-xs font-semibold text-slate-600 mb-1">
                          {msg.fromUserId?.name || "User"}
                        </div>

                        {msg.messageType === "text" && (
                          <div className="text-sm">{msg.text}</div>
                        )}

                        {msg.messageType === "location" && msg.location && (
                          <a
                            href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-cyan-600 underline"
                          >
                            📍 Shared a location
                          </a>
                        )}

                        <div className="text-[11px] text-slate-400 mt-2 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {Object.values(typingUsers).some(Boolean) && (
                  <div className="text-sm text-slate-500 italic">
                    Someone is typing...
                  </div>
                )}

                <div ref={messageEndRef} />
              </>
            )}
          </div>

          <form
            onSubmit={sendMessage}
            className="px-6 py-4 border-t border-cyan-50 flex items-center gap-3 bg-white"
          >
            <input
              type="text"
              placeholder="Write a message..."
              className="flex-1 bg-white border border-cyan-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-200"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping(true);
                setTimeout(() => handleTyping(false), 800);
              }}
            />
            <button
              type="submit"
              className="p-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-full shadow"
            >
              <Send />
            </button>
          </form>
        </section>

        <AnimatePresence>
          {membersOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/30 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMembersOpen(false)}
              />

              <motion.aside
                className="fixed top-16 right-6 w-80 h-[calc(100vh-6rem)] bg-white border border-cyan-100 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-50">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-teal-700">
                      Members
                    </h4>
                    <span className="text-sm text-slate-500">
                      {members.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setMembersOpen(false)}
                    className="p-2 rounded-full bg-white border border-cyan-100"
                  >
                    <X />
                  </button>
                </div>

                <div className="p-4 overflow-y-auto space-y-3">
                  {members.length === 0 ? (
                    <div className="text-sm text-slate-500 p-6 text-center">
                      No members to show.
                    </div>
                  ) : (
                    members.map((m) => (
                      <div
                        key={m._id}
                        className="flex items-center justify-between gap-3 bg-slate-50 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-100 to-teal-100 flex items-center justify-center text-teal-700 font-medium">
                            {m.userId?.name?.slice(0, 1) || "U"}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                              {m.userId?.name || "Unknown"}
                              {m.role === "admin" && (
                                <Crown size={14} className="text-yellow-400" />
                              )}
                            </div>
                            <div className="text-xs text-slate-500">
                              {m.userId?.email}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
                            m.isOnline
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {m.isOnline ? "Online" : "Offline"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
