import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, UserCircle } from "lucide-react";

export default function Navbar({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: "Profile", icon: UserCircle, path: "/profile" },
  ];

  const isActive = (path) =>
    location.pathname === path ||
    location.hash === path.replace("/dashboard", "");

  return (
    <>
      {/* 🌌 Top Navbar */}
      <nav className="w-full fixed top-0 bg-[#0f172a]/80 backdrop-blur-xl h-16 shadow-lg border-b border-blue-900/40 px-6 flex justify-between items-center z-50">
        {/* Logo / Title */}
        <div
          onClick={() => navigate("/dashboard")}
          className="cursor-pointer flex items-center"
        >
          <h1 className="text-lg py-4 md:text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent tracking-wide hover:scale-105 transition-transform duration-300">
            TravelSync
          </h1>
        </div>


        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {/* Profile Button */}
          {/* Profile Button */}
          <button
            onClick={() => navigate("/profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${isActive("/profile")
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30"
              : "text-cyan-300 hover:bg-[#1e293b]/70 hover:text-white"
              }`}
          >
            <UserCircle size={18} />
            Profile
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-cyan-300 border border-cyan-400/40 hover:border-red-400/60 hover:text-red-300 hover:bg-[#1e293b]/70 transition-all duration-300"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-cyan-300 hover:bg-[#1e293b] rounded-md transition"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* 🌙 Sidebar (Mobile) */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={() => setSidebarOpen(false)}
      >
        <div
          className={`absolute top-0 right-0 w-64 bg-[#1e293b]/95 border-l border-blue-800/30 shadow-xl h-full p-6 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-cyan-400">TravelSync</h2>
            <button
              className="text-cyan-400 hover:bg-[#334155] p-2 rounded-full"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="border-b border-blue-800/30 pb-4 mb-6">
            <p className="font-semibold text-cyan-300 text-sm">
              {user?.name || "Traveler"}
            </p>
            <p className="text-xs text-gray-400">{user?.email || "email@example.com"}</p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-3 mb-6">
            {navLinks.map(({ name, icon: Icon, path }) => (
              <button
                key={name}
                onClick={() => {
                  navigate(path);
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-300 ${isActive(path)
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                  : "text-cyan-300 hover:bg-[#334155] hover:text-white"
                  }`}
              >
                <Icon size={18} />
                {name}
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 rounded-md hover:shadow-lg hover:shadow-pink-500/30 flex items-center justify-center gap-2 transition-all duration-300"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
