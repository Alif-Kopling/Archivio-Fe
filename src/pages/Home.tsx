import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useState, useEffect } from "react";

import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";

export default function Home() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const logoControls = useAnimation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    return () => clearInterval(timer);
  }, []);

  const navItems = [
    {
      id: "01",
      label: "Frontend Repo",
      url: "https://github.com/Alif-Kopling/Archivio-fe",
    },
    {
      id: "02",
      label: "Backend Repo",
      url: "https://github.com/Alif-Kopling/Archivio-be",
    },
  ];

  return (
    <div className="relative h-screen w-screen bg-[#0a0c10] overflow-hidden font-sans selection:bg-white/20 transition-colors duration-500">
      {/* Elegant Ambient Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      {/* Main Frame Wrapper */}
      <div className="relative z-10 h-full w-full p-6 md:p-10 flex flex-col border-[1px] border-white/10 m-auto max-w-[1600px] max-h-[900px] lg:my-8 rounded-xl shadow-2xl overflow-hidden backdrop-blur-[1px]">
        {/* Header */}
        <header className="flex justify-between items-center w-full">
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="text-white font-light tracking-[0.5em] text-xl cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            transition={{ duration: 1 }}
          >
            ARCHIVIO
          </motion.div>

          <div className="flex items-center gap-6">
            <ThemeSwitch className="text-white" />
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-1.5 cursor-pointer group"
              initial={{ opacity: 0, x: 20 }}
              transition={{ duration: 1 }}
              whileHover={{ scale: 1.1 }}
            >
              <span className="w-8 h-[1px] bg-white transition-all group-hover:w-12" />
              <span className="w-12 h-[1px] bg-white transition-all group-hover:w-8 text-right self-end" />
            </motion.div>
          </div>
        </header>

        {/* Center Content */}
        <main className="flex-grow flex flex-col items-center justify-center relative">
          {/* Central Logo Decoration */}
          <motion.div
            animate={logoControls}
            className="absolute text-white"
            initial={{ opacity: 0, scale: 0.8, color: "#ffffff", filter: "drop-shadow(0 0 0px rgba(37, 99, 235, 0))" }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <Logo size={550} />
          </motion.div>

          {/* Main Title */}
          <div className="relative z-20 flex flex-col items-center">
            <motion.h1
              animate={{ opacity: 1, letterSpacing: "0.8em" }}
              className="text-white text-4xl md:text-6xl font-extralight tracking-[0.8em] ml-[0.8em] text-center"
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              ARCHIVIO
            </motion.h1>

            <motion.p
              animate={{ opacity: 1 }}
              className="text-white/30 text-[10px] md:text-xs tracking-[0.3em] uppercase font-light mt-4 text-center ml-[0.3em]"
              initial={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 1.5 }}
            >
              Manage Documents Smarter, Not Harder
            </motion.p>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <button
                className="valorant-btn group relative px-10 py-4 bg-transparent border-none cursor-pointer outline-none overflow-hidden"
                onMouseEnter={() =>
                  logoControls.start({
                    opacity: 0.8,
                    scale: 1.1,
                    color: "#2563eb",
                    filter: [
                      "drop-shadow(0 0 10px #3b82f6) drop-shadow(0 0 20px #2563eb) drop-shadow(0 0 40px #1e40af)",
                      "drop-shadow(0 0 15px #3b82f6) drop-shadow(0 0 30px #2563eb) drop-shadow(0 0 70px #1e40af)"
                    ],
                    transition: { 
                      duration: 0.5,
                      filter: { repeat: Infinity, repeatType: "mirror", duration: 1.5 }
                    },
                  })
                }
                onMouseLeave={() =>
                  logoControls.start({
                    opacity: 0.08,
                    scale: 1,
                    color: "#ffffff",
                    filter: "drop-shadow(0 0 0px rgba(37, 99, 235, 0))",
                    transition: { duration: 0.5 },
                  })
                }
                onClick={() => navigate("/login")}
              >
                {/* Button Background Layers */}
                <div className="absolute inset-0 bg-white/5 transition-colors duration-300 group-hover:bg-white/10" />
                <div className="absolute inset-0 border-[1px] border-white/20 transition-colors duration-300 group-hover:border-white/50" />
                
                {/* Valorant Diagonal Cut Shapes */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/40 group-hover:border-white group-hover:scale-125 transition-all duration-300" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/40 group-hover:border-white group-hover:scale-125 transition-all duration-300" />

                {/* Animated Fill */}
                <div className="absolute inset-0 w-0 bg-white transition-all duration-500 ease-out group-hover:w-full opacity-10" />

                {/* The Text */}
                <span className="relative z-10 text-white font-bold tracking-[0.2em] text-xs flex items-center gap-3 transition-all duration-300 group-hover:tracking-[0.3em] group-hover:text-white">
                  <span className="w-1 h-1 bg-white rotate-45 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  EXPLORE NOW
                  <span className="w-1 h-1 bg-white rotate-45 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </span>

                {/* Bottom Glowing Line */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
              </button>
            </motion.div>
          </div>
        </main>

        {/* Footer Info */}
        <footer className="flex flex-col md:flex-row justify-between items-end gap-8">
          {/* Left: Technical Info (Balance) */}
          <div className="flex flex-col gap-2 font-mono text-[10px] tracking-widest text-white/30 uppercase items-start">
            <div className="flex gap-4">
              <span>
                Status: <span className="text-emerald-500/60">Operational</span>
              </span>
              <span>Loc: 0.0000° N, 0.0000° E</span>
            </div>
            <div className="flex gap-4">
              <span>{time.toLocaleTimeString()}</span>
              <span>{time.toLocaleDateString()}</span>
            </div>
            {/* Pagination Dots */}
            <div className="flex gap-3 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`w-1 h-1 rounded-full transition-all duration-500 ${i === 1 ? "bg-white/60 scale-125" : "bg-white/10"}`}
                />
              ))}
            </div>
          </div>

          {/* Right: Nav Items */}
          <div className="flex flex-wrap gap-12 text-white">
            {navItems.map((item, idx) => (
              <motion.div
                key={item.id}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 min-w-[150px] group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                transition={{ delay: 1.2 + idx * 0.2, duration: 0.8 }}
                onClick={() => window.open(item.url, "_blank")}
              >
                <span className="text-[10px] tracking-widest text-white/20 font-mono italic">
                  {item.id}
                </span>
                <span className="text-[11px] tracking-[0.3em] font-extralight uppercase group-hover:translate-x-2 transition-transform duration-300">
                  {item.label}
                </span>
                <div className="h-[1px] w-full bg-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              </motion.div>
            ))}
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate ease-in-out;
        }
        
        .valorant-btn {
          clip-path: polygon(
            0 0,
            calc(100% - 10px) 0,
            100% 10px,
            100% 100%,
            10px 100%,
            0 calc(100% - 10px)
          );
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .valorant-btn:hover {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
          transform: translateY(-2px);
        }

        .valorant-btn:active {
          transform: translateY(1px) scale(0.98);
        }
      `}</style>
    </div>
  );
}
