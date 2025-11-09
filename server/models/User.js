import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    profilePic: { type: String, default: "" },
    currentLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },
    socketId: String,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
