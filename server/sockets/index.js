// sockets/index.js
import { Server } from "socket.io";
import { verifyToken } from "../utils/jwt.js";
import GroupMember from "../models/GroupMember.js";
import GroupMessage from "../models/GroupMessage.js";
import mongoose from "mongoose";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // ✅ Allow all origins in dev
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    console.log("🟢 User connected:", socket.id);

    // ✅ Verify JWT on connection
    const token = socket.handshake.auth?.token;
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("❌ Unauthorized socket connection");
      socket.disconnect();
      return;
    }

    socket.userId = decoded.id;

    // ✅ Join group room
    socket.on("joinGroup", async ({ groupId }) => {
      if (!mongoose.isValidObjectId(groupId)) {
        console.warn("⚠️ Invalid groupId:", groupId);
        return;
      }

      socket.join(groupId);
      console.log(`👥 User ${socket.userId} joined group ${groupId}`);

      try {
        // Mark user as online
        await GroupMember.findOneAndUpdate(
          { userId: socket.userId, groupId },
          { isOnline: true },
          { upsert: true, new: true }
        );

        // Fetch group members
        const members = await GroupMember.find({ groupId }).populate(
          "userId",
          "name email"
        );

        // Flatten member payload
        const payload = members.map((m) => ({
          _id: m._id,
          groupId: m.groupId,
          userId: m.userId?._id,
          name: m.userId?.name,
          email: m.userId?.email,
          lat: m.lastLocation?.lat || null,
          lng: m.lastLocation?.lng || null,
          isOnline: m.isOnline,
          role: m.role,
        }));

        // Send member list + chat history to current user
        const recentMessages = await GroupMessage.find({ groupId })
          .sort({ createdAt: 1 })
          .limit(100)
          .populate("fromUserId", "name email");

        socket.emit("initialMessages", recentMessages);
        io.to(groupId).emit("groupMembers", payload);
      } catch (err) {
        console.error("❌ Error joining group:", err.message);
      }
    });

    // ✅ Send chat message
    socket.on("sendMessage", async ({ groupId, text }) => {
      try {
        if (!groupId || !text) return;
        const message = await GroupMessage.create({
          groupId,
          fromUserId: socket.userId,
          text,
          messageType: "text",
        });

        const populated = await GroupMessage.findById(message._id).populate(
          "fromUserId",
          "name email"
        );

        io.to(groupId).emit("newMessage", populated);
      } catch (err) {
        console.error("❌ Error sending message:", err.message);
      }
    });

    // 🟡 Typing Indicator
    socket.on("typing", ({ groupId, isTyping }) => {
      if (!groupId) return;
      socket.to(groupId).emit("typing", { userId: socket.userId, isTyping });
    });

    // 📍 Share location as chat message
    socket.on("shareLocation", async ({ groupId, lat, lng }) => {
      try {
        if (!groupId || !lat || !lng) return;

        const message = await GroupMessage.create({
          groupId,
          fromUserId: socket.userId,
          location: { lat, lng },
          messageType: "location",
        });

        const populated = await GroupMessage.findById(message._id).populate(
          "fromUserId",
          "name email"
        );

        io.to(groupId).emit("newMessage", populated);

        // Also update GroupMember location
        await GroupMember.findOneAndUpdate(
          { groupId, userId: socket.userId },
          { lastLocation: { lat, lng, updatedAt: new Date() }, isOnline: true },
          { upsert: true, new: true }
        );

        // Refresh member list for group map sync
        const members = await GroupMember.find({ groupId }).populate(
          "userId",
          "name email"
        );
        io.to(groupId).emit("groupMembers", members);
      } catch (err) {
        console.error("❌ Error sharing location:", err.message);
      }
    });

    // 🔵 Live location updates
    socket.on("locationUpdate", async ({ groupId, lat, lng }) => {
      if (!groupId || !lat || !lng) return;

      try {
        if (mongoose.isValidObjectId(groupId)) {
          await GroupMember.findOneAndUpdate(
            { userId: socket.userId, groupId },
            {
              lastLocation: { lat, lng, updatedAt: new Date() },
              isOnline: true,
            },
            { upsert: true, new: true }
          );

          const members = await GroupMember.find({ groupId }).populate(
            "userId",
            "name email"
          );

          const payload = members.map((m) => ({
            _id: m._id,
            groupId: m.groupId,
            userId: m.userId?._id,
            name: m.userId?.name,
            email: m.userId?.email,
            lat: m.lastLocation?.lat || null,
            lng: m.lastLocation?.lng || null,
            isOnline: m.isOnline,
            role: m.role,
          }));

          io.to(groupId).emit("groupLocations", payload);
        }
      } catch (err) {
        console.error("❌ Error updating location:", err.message);
      }
    });

    // 🚪 Disconnect
    socket.on("disconnect", async () => {
      console.log(`🔴 User disconnected: ${socket.id}`);
      try {
        await GroupMember.findOneAndUpdate(
          { userId: socket.userId },
          { isOnline: false }
        );
      } catch (err) {
        console.error("❌ Error marking user offline:", err.message);
      }
    });
  });

  return io;
};
