// models/GroupMember.js
import mongoose from "mongoose";

const groupMemberSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    lastLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },
    eta: {
      type: Number, // estimated time in minutes
      default: 0,
    },
    routeDeviation: {
      type: Boolean,
      default: false, // true if user goes off-route
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Each (groupId + userId) pair must be unique
groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export default mongoose.model("GroupMember", groupMemberSchema);
