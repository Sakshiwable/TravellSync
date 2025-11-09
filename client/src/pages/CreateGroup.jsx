import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, PlusCircle, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdGroup, setCreatedGroup] = useState(null); // ✅ store newly created group
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:4000/api/groups/create",
        { groupName, destination },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("✅ Group created successfully!");
      setCreatedGroup(res.data.group); // ✅ save the created group data
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create group. Please try again.");
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
            <PlusCircle size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-blue-800">
            Create a New Group
          </h2>
          <p className="text-blue-500 text-sm mt-1">
            Plan a trip and invite your friends to join!
          </p>
        </div>

        {/* Form */}
        {!createdGroup ? (
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-blue-800 font-medium mb-1 text-sm">
                Group Name
              </label>
              <input
                type="text"
                placeholder="Enter group name"
                className="w-full border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg outline-none text-gray-700 shadow-sm transition"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-blue-800 font-medium mb-1 text-sm">
                Destination
              </label>
              <input
                type="text"
                placeholder="Enter destination (e.g. Goa, Pune)"
                className="w-full border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg outline-none text-gray-700 shadow-sm transition"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
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
              <PlusCircle size={20} />
              {loading ? "Creating..." : "Create Group"}
            </button>
          </form>
        ) : (
          // ✅ Success Section After Group Creation
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold text-blue-800">
              🎉 Group Created: <span className="font-bold">{createdGroup.groupName}</span>
            </h3>
            <p className="text-blue-500">Destination: {createdGroup.destination}</p>

            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() =>
                  navigate(
                    `/invite-friend?groupName=${encodeURIComponent(
                      createdGroup.groupName
                    )}`
                  )
                }
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md transition"
              >
                <Mail size={16} /> Invite Friends
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-blue-800 px-5 py-2 rounded-lg shadow-md transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
