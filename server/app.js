// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import routeRoutes from "./routes/routeRoutes.js"; // if you added this for ORS
import friendRoutes from "./routes/friendRoutes.js";


dotenv.config();

const app = express();

// 🧱 Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173"], // frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// 🔗 API Routes
app.use("/api/auth", authRoutes);
app.use("/api/route", routeRoutes); // optional: for route data
app.use("/api/friends", friendRoutes);
app.use("/api/groups", groupRoutes); 

// 🛠️ Default Route (for quick test)
app.get("/", (req, res) => {
  res.send("🚀 TravelSync API is running...");
});

// ❌ Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ message: "Something went wrong!" });
});

export default app;
