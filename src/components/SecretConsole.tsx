import { useState, useEffect, useRef, useCallback } from "react";

import { executeCommand } from "@/utils/commands";

type Entry = { type: "input" | "output"; text: string };

export default function SecretConsole() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Entry[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addEntry = useCallback((entry: Entry) => {
    setHistory((prev) => [...prev, entry]);
  }, []);

  const handleSubmit = useCallback(async () => {
    const cmd = input.trim();
    if (!cmd) return;

    addEntry({ type: "input", text: `> ${cmd}` });

    const result = await executeCommand(cmd);

    if (result === null) {
      addEntry({ type: "output", text: `Unknown command: ${cmd}. Type /help` });
    } else {
      if (result.message) addEntry({ type: "output", text: result.message });
      if (result.message === "" && cmd === "/clear") {
        setHistory([]);
      }
      result.effect?.();
    }

    setInput("");
    setHistoryIdx(-1);
  }, [input, addEntry]);

  useEffect(() => {
    if (!open) {
      setHistory([]);
      setHistoryIdx(-1);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === ";") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);

        return;
      }
      if (e.key === "Enter") {
        handleSubmit();

        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const entries = history
          .filter((h) => h.type === "input")
          .map((h) => h.text.replace("> ", ""));

        if (entries.length === 0) return;
        const newIdx =
          historyIdx === -1 ? entries.length - 1 : Math.max(0, historyIdx - 1);

        setHistoryIdx(newIdx);
        setInput(entries[newIdx] || "");

        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const entries = history
          .filter((h) => h.type === "input")
          .map((h) => h.text.replace("> ", ""));

        if (entries.length === 0 || historyIdx === -1) return;
        const newIdx = historyIdx + 1;

        if (newIdx >= entries.length) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(newIdx);
          setInput(entries[newIdx] || "");
        }
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [open, history, historyIdx, handleSubmit]);

  if (!open) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] w-[380px] max-w-[calc(100vw-2rem)] shadow-2xl"
      style={{ fontFamily: "'Courier New', monospace" }}
    >
      <div
        className="rounded-lg border overflow-hidden backdrop-blur-md"
        style={{
          background: "rgba(0,0,0,0.88)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-widest select-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.3)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span>Secret Console — /help</span>
          <button
            className="bg-transparent border-none cursor-pointer text-white/20 hover:text-white/60 text-xs leading-none p-0"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Output */}
        <div
          className="max-h-[260px] overflow-y-auto px-3 py-2 space-y-1"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.1) transparent",
          }}
        >
          {history.length === 0 && (
            <div
              className="text-[10px] leading-relaxed"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              Archivio Secret Console. Ketik /help untuk daftar perintah.
            </div>
          )}
          {history.map((entry, i) => (
            <div
              key={i}
              className="text-[10px] leading-relaxed whitespace-pre-wrap break-words"
              style={{
                color:
                  entry.type === "input"
                    ? "rgba(255,255,255,0.5)"
                    : "rgba(255,255,255,0.8)",
              }}
            >
              {entry.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="px-3 py-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <input
            ref={inputRef}
            autoComplete="off"
            className="w-full bg-transparent border-none outline-none text-[11px] placeholder:text-white/15"
            placeholder="Type a command..."
            spellCheck={false}
            style={{
              color: "rgba(255,255,255,0.7)",
              fontFamily: "'Courier New', monospace",
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
