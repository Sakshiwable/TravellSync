import { useEffect, useState } from "react";
import axios from "axios";

export default function InvitesList() {
  const [invites, setInvites] = useState([]);
  const token = localStorage.getItem("token");

  const fetchInvites = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/friends/invites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvites(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await axios.post(
        "http://localhost:4000/api/groups/accept",
        { requestId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ You joined the group!");
      fetchInvites();
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Error accepting invite"));
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  return (
    <div className="max-w-2xl mx-auto w-screen p-6">
      <h2 className="text-2xl font-semibold mb-4">📨 Pending Invites</h2>
      {invites.length === 0 ? (
        <p>No invites found.</p>
      ) : (
        invites.map((invite) => (
          <div
            key={invite._id}
            className="border p-4 rounded-md shadow-sm flex justify-between items-center mb-3"
          >
            <div>
              <p className="font-medium">
                {invite.fromUserId?.name || "Someone"}
              </p>
              <p className="text-gray-600 text-sm">
                Group: {invite.groupId?.groupName}
              </p>
            </div>
            <button
              onClick={() => handleAccept(invite._id)}
              className="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700"
            >
              Accept
            </button>
          </div>
        ))
      )}
    </div>
  );
}
