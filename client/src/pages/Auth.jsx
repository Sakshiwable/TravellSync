// src/pages/Auth.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Send, User, Mail, Lock } from "lucide-react";
import bgVideo from "../assets/background.mp4";

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
      toast.success(
        isSignup ? "🎉 Signup successful!" : "✅ Login successful!"
      );
      navigate("/dashboard");
    } catch (err) {
      console.error("Auth error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover -z-10"
        src={bgVideo}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />

      {/* subtle tint + blur overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-teal-500/12 to-white/10 -z-10" />

      <div className="w-full max-w-md  grid grid-cols-1 md:grid-cols-1 gap-3 items-center relative z-10">
        {/* Illustration / Brand */}
        <div className="hidden md:flex flex-row items-center gap-4 justify-center rounded-2xl p-3 bg-white/40 border border-cyan-100 shadow-xl backdrop-blur-sm h-20 ">
          <div className="w-12 h-12 p-3 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-2xl my-auto">
            <Send size={40} />
          </div>

          <h1 className="text-2xl font-extrabold text-teal-700 mb-2">
            TravelSync
          </h1>
      

        </div>

        {/* Auth Form */}
        <div className="bg-white/95 rounded-2xl p-8 shadow-2xl border border-cyan-100 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-teal-700">
                {isSignup ? "Create your account" : "Welcome back"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {isSignup
                  ? "Sign up to create groups and share live locations."
                  : "Sign in to continue to TravelSync."}
              </p>
            </div>

            <div className="text-xs text-slate-400">
              Secure · Fast · Private
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <label className="block">
                <div className="flex items-center text-sm text-teal-700 font-medium mb-2">
                  <User size={14} className="mr-2 text-cyan-600" /> Full name
                </div>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-cyan-100 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                  placeholder="Your full name"
                />
              </label>
            )}

            <label className="block">
              <div className="flex items-center text-sm text-teal-700 font-medium mb-2">
                <Mail size={14} className="mr-2 text-cyan-600" /> Email
              </div>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-cyan-100 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <div className="flex items-center text-sm text-teal-700 font-medium mb-2">
                <Lock size={14} className="mr-2 text-cyan-600" /> Password
              </div>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-cyan-100 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                placeholder="Create a secure password"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-full text-white font-semibold shadow-md transition ${
                loading
                  ? "opacity-70 cursor-not-allowed bg-gradient-to-r from-cyan-300 to-teal-300"
                  : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-105"
              }`}
            >
              {loading
                ? "Please wait..."
                : isSignup
                ? "Create account"
                : "Sign in"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-cyan-600 hover:underline"
            >
              {isSignup
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </button>

            <button
              onClick={() => {
                setForm({
                  ...form,
                  email: "abc123@gmail.com",
                  password: "password",
                });
                toast("Demo credentials filled", { icon: "⚡️" });
              }}
              className="text-slate-500 hover:text-slate-700"
            >
              Quick demo
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
