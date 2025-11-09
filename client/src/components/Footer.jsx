// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-center bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-t border-blue-900/40 text-center text-sm text-gray-400 backdrop-blur-xl z-40">
      <div className="max-w-5xl w-full px-4 flex flex-col items-center">
        <p className="tracking-wide text-xs">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
            TravelSync
          </span>{" "}
          • Built with 💙 Passion & Code
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5">
          All rights reserved • Empowering seamless travel experiences
        </p>
      </div>
    </footer>
  );
}
