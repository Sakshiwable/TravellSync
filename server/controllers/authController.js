import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

// 🧾 REGISTER (Signup)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔍 Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields (name, email, password) are required." });
    }

    // 🧠 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists. Please login." });
    }

    // 🔒 Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🆕 Create new user
    const newUser = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
    });

    // 🔑 Generate JWT token
    const token = generateToken(newUser._id);

    console.log(`✅ New user registered: ${newUser.email}`);

    res.status(201).json({
      message: "Signup successful!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("❌ Error in registerUser:", error.message);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// 🔑 LOGIN (existing user)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🧠 Check required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // 🔍 Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please signup first." });
    }

    // 🔑 Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.warn(`⚠️ Invalid password for user: ${email}`);
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // 🎟️ Generate token
    const token = generateToken(user._id);

    console.log(`✅ User logged in: ${email}`);

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Error in loginUser:", error.message);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// 👤 GET PROFILE (for logged-in users)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("name email _id");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("❌ Error fetching profile:", error.message);
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};
