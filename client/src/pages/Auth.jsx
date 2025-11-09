// src/pages/Auth.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // optional for nice notifications

export default function Auth() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isSignup
        ? "http://localhost:4000/api/auth/register"
        : "http://localhost:4000/api/auth/login";

      const payload = isSignup
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const res = await axios.post(endpoint, payload, {
        headers: { "Content-Type": "application/json" },
      });

      localStorage.setItem("token", res.data.token);
      toast.success(isSignup ? "🎉 Signup successful!" : "✅ Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Auth error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-gray-100">
      <div className="w-full max-w-md p-8 rounded-2xl backdrop-blur-lg bg-[#1e293b]/70 shadow-2xl border border-cyan-500/20">
        <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent mb-6">
          TravelSync
        </h1>

        <h2 className="text-xl font-semibold text-center text-cyan-300 mb-6">
          {isSignup ? "Create an Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && (
            <div>
              <label className="block text-sm text-cyan-300 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full bg-[#0f172a]/60 text-gray-100 border border-cyan-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-cyan-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-[#0f172a]/60 text-gray-100 border border-cyan-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-cyan-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full bg-[#0f172a]/60 text-gray-100 border border-cyan-500/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="text-center text-sm mt-5 text-gray-400">
          {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
          <span
            onClick={() => setIsSignup(!isSignup)}
            className="text-cyan-400 cursor-pointer hover:underline"
          >
            {isSignup ? "Login here" : "Sign up here"}
          </span>
        </p>

        <p className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} TravelSync — Seamless journeys with friends ✈️
        </p>
      </div>
    </div>
  );
}
