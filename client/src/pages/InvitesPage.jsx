import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast from "react-hot-toast";

const API_URL = "http://localhost:4000/api";

export default function InvitesPage() {
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/friends/invites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvites(res.data.invites || []);
    } catch (err) {
      toast.error("Failed to load invites");
      console.error(err);
    }
  };

  const acceptInvite = async (inviteId, groupId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/groups/accept`,
        { inviteId, groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Joined group successfully!");
      fetchInvites();
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept invite");
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-gray-100">
      <Navbar />

      <main className="flex-1 mt-16 p-8">
        <h2 className="text-2xl font-bold text-cyan-300 mb-6">
          📬 Pending Group Invites
        </h2>

        {invites.length === 0 ? (
          <p className="text-gray-400">You have no pending invites.</p>
        ) : (
          <div className="space-y-4">
            {invites.map((invite) => (
              <div
                key={invite._id}
                className="bg-[#1e293b]/70 border border-cyan-500/20 rounded-xl p-5 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-cyan-300">
                    {invite.fromUserId?.name} invited you to join{" "}
                    <span className="font-semibold text-blue-400">
                      {invite.groupId?.groupName}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400">
                    From: {invite.fromUserId?.email}
                  </p>
                </div>

                <button
                  onClick={() => acceptInvite(invite._id, invite.groupId?._id)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg text-white hover:shadow-lg hover:shadow-cyan-500/30 transition"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
