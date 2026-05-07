import { useNavigate } from "react-router-dom";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import introSound from "@/assets/sound-awal-masuk-ke-page-home.mp3";
import exploreSound from "@/assets/sound-succes-login.mp3";
import hoverSound from "@/assets/select-button.mp3";
import clickSound from "@/assets/button-sound1.mp3";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";

export default function Home() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showSplash, setShowSplash] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const logoControls = useAnimation();

  /**
   * Triggers auditory feedback for hover interactions
   */
  const playHoverSound = () => {
    const audio = new Audio(hoverSound);
    audio.volume = 0.4;
    audio.play().catch((e) => console.log("Hover sound failed:", e));
  };

  /**
   * Triggers auditory feedback for primary click interactions
   */
  const playClickSound = () => {
    const audio = new Audio(clickSound);
    audio.volume = 0.5;
    audio.play().catch((e) => console.log("Click sound failed:", e));
  };

  /**
   * Initiates the system startup sequence and synchronizes audio-visual states
   */
  const handleStart = () => {
    const audio = new Audio(introSound);

    audio.volume = 0.6;
    audio.play().catch((e) => console.log("Intro sound failed:", e));
    setShowSplash(false);

    // Sequence logo animation to synchronize with intro audio completion (approx. 13.5s)
    setTimeout(async () => {
      setIsLocked(false);
      await logoControls.start({
        opacity: 0.8,
        scale: 1.1,
        color: "#00a2ffff",
        filter: "drop-shadow(0 0 20px #3b82f6) drop-shadow(0 0 40px #2563eb)",
        transition: { duration: 1 },
      });
      await logoControls.start({
        opacity: 0.08,
        scale: 1,
        color: "#ffffff",
        filter: "drop-shadow(0 0 0px rgba(37, 99, 235, 0))",
        transition: { duration: 1 },
      });
    }, 13500);
  };

  /**
   * Manages transition to the authenticated application area with synchronized audio effects
   */
  const handleExplore = () => {
    playClickSound();

    // 500ms delay to prevent audio overlapping between click and success events
    setTimeout(() => {
      const audio = new Audio(exploreSound);

      audio.volume = 0.5;
      audio.play().catch((e) => console.log("Audio play failed:", e));

      // Post-success audio buffer before navigation to ensure completion of auditory feedback
      setTimeout(() => {
        navigate("/login");
      }, 300);
    }, 500);
  };

  /**
   * System clock synchronization
   */
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    return () => clearInterval(timer);
  }, []);

  /**
   * Repository metadata for footer navigation
   */
  const navItems = [
    {
      id: "01",
      label: "Frontend Repo",
      url: "https://github.com/Alif-Kopling/Archivio-fe",
      color:
        "group-hover:text-blue-400 group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]",
      lineColor: "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]",
    },
    {
      id: "02",
      label: "Backend Repo",
      url: "https://github.com/Alif-Kopling/Archivio-be",
      color:
        "group-hover:text-yellow-400 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]",
      lineColor: "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]",
    },
  ];

  return (
    <div className="relative h-screen w-screen bg-[#0a0c10] overflow-hidden font-sans selection:bg-white/20 transition-colors duration-500">
      <AnimatePresence mode="wait">
        {showSplash && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center cursor-pointer overflow-hidden"
            exit={{ opacity: 0, scale: 1.1 }}
            initial={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            onClick={handleStart}
          >
            {/* Visual backdrop for initial synchronization stage */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />
            </div>

            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 2, ease: "easeOut" }}
            >
              <Logo className="text-white opacity-20" size={200} />
              <div className="mt-8 flex flex-col items-center gap-2">
                <h2 className="text-white font-extralight tracking-[1em] text-2xl ml-[1em]">
                  ARCHIVIO
                </h2>
                <motion.p
                  animate={{ opacity: [0.2, 0.6, 0.2] }}
                  className="text-white/40 text-[10px] tracking-[0.4em] uppercase mt-4"
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Click to Synchronize
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSplash && (
        <>
          {/* Global background lighting effects */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
          </div>

          {/* Primary UI container with structural framing and motion scaling */}
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 h-full w-full p-6 md:p-10 flex flex-col border-[1px] border-white/10 m-auto max-w-[1600px] max-h-[900px] lg:my-8 rounded-xl shadow-2xl overflow-hidden backdrop-blur-[1px]"
            initial={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {/* Application header with brand identity and global controls */}
            <header className="flex justify-between items-center w-full">
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="text-white font-light tracking-[0.5em] text-xl cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                ARCHIVIO
              </motion.div>

              <div className="flex items-center gap-6">
                <ThemeSwitch className="text-white" />
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-1.5 cursor-pointer group"
                  initial={{ opacity: 0, x: 20 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="w-8 h-[1px] bg-white transition-all group-hover:w-12" />
                  <span className="w-12 h-[1px] bg-white transition-all group-hover:w-8 text-right self-end" />
                </motion.div>
              </div>
            </header>

            {/* Main interactive viewport */}
            <main className="flex-grow flex flex-col items-center justify-center relative">
              {/* Center-aligned brand identity with dynamic animation states */}
              <motion.div
                animate={logoControls}
                className="absolute text-white"
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  color: "#ffffff",
                  filter: "drop-shadow(0 0 0px rgba(37, 99, 235, 0))",
                }}
                transition={{ duration: 2, ease: "easeOut" }}
              >
                <Logo size={550} />
              </motion.div>

              {/* Primary brand heading and tagline */}
              <div className="relative z-20 flex flex-col items-center">
                <motion.h1
                  animate={{ opacity: 1, letterSpacing: "0.8em" }}
                  className="text-white text-4xl md:text-6xl font-extralight tracking-[0.8em] ml-[0.8em] text-center"
                  initial={{ opacity: 0, letterSpacing: "0.5em" }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                >
                  ARCHIVIO
                </motion.h1>

                <motion.p
                  animate={{ opacity: 1 }}
                  className="text-white/30 text-[10px] md:text-xs tracking-[0.3em] uppercase font-light mt-4 text-center ml-[0.3em]"
                  initial={{ opacity: 0 }}
                  transition={{ delay: 1.2, duration: 1.5 }}
                >
                  Manage Documents Smarter, Not Harder
                </motion.p>

                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12"
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ delay: 1.8, duration: 1 }}
                >
                  <button
                    disabled={isLocked}
                    className={`valorant-btn group relative min-w-[200px] py-3 bg-transparent border-none cursor-pointer outline-none overflow-hidden transition-all duration-500 ${isLocked ? "opacity-60 grayscale-[0.5] cursor-wait scale-95" : "opacity-100 grayscale-0"}`}
                    onClick={handleExplore}
                    onMouseEnter={() => {
                      if (!isLocked) {
                        playHoverSound();
                        logoControls.start({
                          opacity: 0.8,
                          scale: 1.1,
                          color: "#00a2ffff",
                          filter: [
                            "drop-shadow(0 0 10px #3b82f6) drop-shadow(0 0 20px #2563eb) drop-shadow(0 0 40px #1e40af)",
                            "drop-shadow(0 0 15px #3b82f6) drop-shadow(0 0 30px #2563eb) drop-shadow(0 0 70px #1e40af)",
                          ],
                          transition: {
                            duration: 0.5,
                            filter: {
                              repeat: Infinity,
                              repeatType: "mirror",
                              duration: 1.5,
                            },
                          },
                        });
                      }
                    }}
                    onMouseLeave={() =>
                      !isLocked && logoControls.start({
                        opacity: 0.08,
                        scale: 1,
                        color: "#ffffff",
                        filter: "drop-shadow(0 0 0px rgba(37, 99, 235, 0))",
                        transition: { duration: 0.5 },
                      })
                    }
                  >
                    {/* Multi-layered visual button architecture */}
                    <div className={`absolute inset-0 transition-colors duration-300 ${isLocked ? "bg-transparent" : "bg-white/5 group-hover:bg-white/10"}`} />
                    <div className={`absolute inset-0 border-[1px] transition-colors duration-300 ${isLocked ? "border-transparent" : "border-white/20 group-hover:border-white/50"}`} />

                    {/* Geometric corner accents for stylized UI */}
                    <div className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 transition-all duration-300 ${isLocked ? "border-transparent" : "border-white/40 group-hover:border-white group-hover:scale-125"}`} />
                    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 transition-all duration-300 ${isLocked ? "border-transparent" : "border-white/40 group-hover:border-white group-hover:scale-125"}`} />

                    {/* Motion-based button interaction feedback */}
                    {!isLocked && <div className="absolute inset-0 w-0 bg-white transition-all duration-500 ease-out group-hover:w-full opacity-10" />}

                    {/* State-dependent content renderer for primary CTA */}
                    <div className="relative z-10 w-full flex items-center justify-center gap-3">
                      <span className={`w-1 h-1 bg-white rotate-45 transition-opacity duration-300 ${isLocked ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`} />
                      
                      <div className="flex flex-col items-center justify-center min-h-[40px]">
                        {isLocked ? (
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="flex items-center gap-2 animate-pulse font-mono text-[12px] font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] tracking-[0.15em] uppercase">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                              Loading System
                            </span>
                            <div className="w-28 h-[1px] bg-blue-500/20 relative overflow-hidden">
                              <motion.div 
                                animate={{ x: ["-100%", "100%"] }}
                                className="absolute inset-0 w-1/2 bg-blue-400 shadow-[0_0_10px_#60a5fa]"
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-white font-bold tracking-[0.25em] text-xs transition-all duration-300 group-hover:tracking-[0.35em] group-hover:text-white uppercase">
                            EXPLORE NOW
                          </span>
                        )}
                      </div>

                      <span className={`w-1 h-1 bg-white rotate-45 transition-opacity duration-300 ${isLocked ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`} />
                    </div>

                    {/* High-intensity focus indicator */}
                    {!isLocked && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 shadow-[0_0_15px_rgba(255,255,255,0.6)]" />}
                  </button>
                </motion.div>
              </div>
            </main>

            {/* System telemetry and metadata footer */}
            <footer className="flex flex-col md:flex-row justify-between items-end gap-8">
              {/* Real-time system status and localization data */}
              <div className="flex flex-col gap-2 font-mono text-[10px] tracking-widest text-white/30 uppercase items-start">
                <div className="flex gap-4">
                  <span>
                    Status:{" "}
                    <span className="text-emerald-500/60">Operational</span>
                  </span>
                  <span>Loc: 0.0000° N, 0.0000° E</span>
                </div>
                <div className="flex gap-4">
                  <span>{time.toLocaleTimeString()}</span>
                  <span>{time.toLocaleDateString()}</span>
                </div>
                {/* Decorative session progression indicators */}
                <div className="flex gap-3 mt-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className={`w-1 h-1 rounded-full transition-all duration-500 ${i === 1 ? "bg-white/60 scale-125" : "bg-white/10"}`}
                    />
                  ))}
                </div>
              </div>

              {/* External repository navigation interfaces */}
              <div className="flex flex-wrap gap-12 text-white">
                {navItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-2 min-w-[150px] group cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ delay: 2 + idx * 0.2, duration: 0.8 }}
                    onClick={() => {
                      playClickSound();
                      window.open(item.url, "_blank");
                    }}
                    onMouseEnter={playHoverSound}
                  >
                    <span className="text-[10px] tracking-widest text-white/20 font-mono italic">
                      {item.id}
                    </span>
                    <span
                      className={`text-[11px] tracking-[0.3em] font-extralight uppercase transition-all duration-300 ${item.color} group-hover:translate-x-2`}
                    >
                      {item.label}
                    </span>
                    <div className="h-[1px] w-full bg-white/5 relative overflow-hidden">
                      <div
                        className={`absolute inset-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${item.lineColor}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </footer>
          </motion.div>
        </>
      )}

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
        
        .valorant-btn:hover:not(:disabled) {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
          transform: translateY(-2px);
        }

        .valorant-btn:active:not(:disabled) {
          transform: translateY(1px) scale(0.98);
        }
      `}</style>
    </div>
  );
}
