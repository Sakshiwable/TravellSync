import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = "http://localhost:4000/api";

export default function InviteFriend() {
  const [friendEmail, setFriendEmail] = useState("");
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Auto-fill group name from URL (if present)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const name = params.get("groupName");
    if (name) setGroupName(decodeURIComponent(name));
  }, [location]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/groups/invite`,
        { email: friendEmail, groupName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("🎉 Invite sent successfully!");
      setFriendEmail("");
      setGroupName("");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to send invite. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 px-4 py-12">
      <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl border border-blue-100 w-full max-w-md p-8 relative">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute top-4 left-4 flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6 mt-4">
          <div className="mx-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-md mb-3">
            <Send size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-blue-800">Invite a Friend</h2>
          <p className="text-blue-500 text-sm mt-1">
            Send an invite link to join your group.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleInvite} className="space-y-5">
          <div>
            <label className="block text-blue-800 font-medium mb-1 text-sm">
              Friend’s Email
            </label>
            <input
              type="email"
              placeholder="Enter friend's email"
              className="w-full border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg outline-none text-gray-700 shadow-sm transition"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-blue-800 font-medium mb-1 text-sm">
              Group Name
            </label>
            <input
              type="text"
              placeholder="Enter your group name"
              className="w-full border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg outline-none text-gray-700 shadow-sm transition"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition ${
              loading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            <Send size={20} />
            {loading ? "Sending..." : "Send Invite"}
          </button>
        </form>
      </div>
    </div>
  );
}
