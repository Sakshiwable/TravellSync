// routes/authRoutes.js
import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/authController.js";
import { verifyTokenMiddleware } from "../utils/jwt.js";

const router = express.Router();

// 🧾 Signup new user
router.post("/register", registerUser);

// 🔑 Login existing user
router.post("/login", loginUser);

// 👤 Get logged-in user info (for dashboard)
router.get("/profile", verifyTokenMiddleware, getProfile);

export default router;
