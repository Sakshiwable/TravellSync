// server/routes/routeRoutes.js
import express from "express";
import { getRouteInfo } from "../services/googleApi.js"; // or routeService.js if renamed

const router = express.Router();

// POST /api/route
router.post("/", async (req, res) => {
  try {
    const { origin, destination } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ message: "Origin and destination are required." });
    }

    const route = await getRouteInfo(origin, destination);
    if (!route) return res.status(500).json({ message: "Failed to get route info" });

    res.json(route);
  } catch (error) {
    console.error("Error fetching route:", error.message);
    res.status(500).json({ message: "Error fetching route", error: error.message });
  }
});

export default router;
