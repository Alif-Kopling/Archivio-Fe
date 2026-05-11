import api from "@/lib/axios";

type Result = { message: string; effect?: () => void };

export interface Command {
  name: string;
  desc: string;
  usage?: string;
  handler: (args: string[]) => Result | Promise<Result>;
}

const commands: Command[] = [
  // ─── SERIOUS COMMANDS ───
  {
    name: "/help",
    desc: "Menampilkan daftar perintah",
    usage: "",
    handler: () => ({
      message: [
        "=== ARCHIVIO CONSOLE ===",
        "",
        ...commands.map(
          (c) => `    ${c.name}${(c.usage ? " " + c.usage : "").padEnd(18)} ${c.desc}`,
        ),
      ].join("\n"),
    }),
  },
  {
    name: "/theme",
    desc: "Ganti tema (dark/light/toggle)",
    usage: "[mode]",
    handler: (args) => {
      const current = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
      const mode = args[0] || "toggle";
      let next: string;

      if (mode === "dark") next = "dark";
      else if (mode === "light") next = "light";
      else next = current === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");

      return { message: "Tema diubah ke: " + next.toUpperCase() };
    },
  },
  {
    name: "/goto",
    desc: "Navigasi ke halaman",
    usage: "[path]",
    handler: (args) => {
      const path = args[0];

      if (!path)
        return {
          message:
            "Usage: /goto [path]\n  Contoh: /goto archives, /goto admin/users",
        };
      const routes: Record<string, string> = {
        home: "/",
        login: "/login",
        dashboard: "/admin",
        admin: "/admin",
        users: "/admin/users",
        settings: "/admin/settings",
        archives: "/archives",
        "surat-masuk": "/archives/surat-masuk",
        "surat-keluar": "/archives/surat-keluar",
        sertifikat: "/archives/sertifikat",
      };
      const resolved =
        routes[path.toLowerCase()] ||
        (path.startsWith("/") ? path : "/" + path);

      window.history.pushState({}, "", resolved);
      window.dispatchEvent(new PopStateEvent("popstate"));

      return { message: "Navigasi ke: " + resolved };
    },
  },
  {
    name: "/fullscreen",
    desc: "Toggle fullscreen",
    handler: () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});

        return { message: "Masuk fullscreen" };
      }
      document.exitFullscreen().catch(() => {});

      return { message: "Keluar fullscreen" };
    },
  },
  {
    name: "/reload",
    desc: "Reload halaman",
    handler: () => ({
      message: "Reloading...",
      effect: () => {
        window.location.reload();
      },
    }),
  },
  {
    name: "/logout",
    desc: "Logout & redirect ke login",
    handler: () => ({
      message: "Logging out...",
      effect: () => {
        localStorage.clear();
        window.location.href = "/login";
      },
    }),
  },
  {
    name: "/version",
    desc: "Info versi aplikasi",
    handler: () => ({
      message: [
        "=== VERSION INFO ===",
        "Archivio v1.0.0",
        "Runtime: " + navigator.userAgent.slice(0, 40) + "...",
        "Platform: " + navigator.platform,
        "Language: " + navigator.language,
      ].join("\n"),
    }),
  },
  {
    name: "/time",
    desc: "Tampilkan waktu saat ini",
    handler: () => ({
      message:
        "Sekarang: " +
        new Date().toLocaleString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
    }),
  },
  {
    name: "/ping",
    desc: "Cek respon console",
    handler: () => ({
      message: "pong! (console aktif)",
    }),
  },
  {
    name: "/clear",
    desc: "Bersihkan console",
    handler: () => ({
      message: "",
    }),
  },
  {
    name: "cls",
    desc: "Bersihkan console (alias /clear)",
    handler: () => ({
      message: "",
    }),
  },
  {
    name: "/rm",
    desc: "Hapus resource (trash)",
    usage: "[resource]",
    handler: async (args) => {
      const sub = args[0];
      if (sub === "trash") {
        try {
          await api.delete("/settings/trash/rejected");
          return { message: "Semua dokumen rejected berhasil dihapus dari trash!" };
        } catch {
          return { message: "Gagal hapus trash. Mungkin kosong atau error." };
        }
      }
      return { message: "Usage: /rm trash\n  Contoh: /rm trash" };
    },
  },
  {
    name: "/ban",
    desc: "Hapus akun staff (admin only)",
    usage: "[nama]",
    handler: async (args) => {
      const name = args.join(" ");
      if (!name) return { message: "Usage: /ban [nama staff]\n  Contoh: /ban bambang" };

      try {
        const res = await api.get("/users?search=" + encodeURIComponent(name));
        const users = res.data as Array<{ id: number; name: string; email: string; role: string; _count: { documents: number } }>;
        const match = users.find((u) => u.name.toLowerCase() === name.toLowerCase() && u.role === "staff");

        if (!match) return { message: "Staff \"" + name + "\" tidak ditemukan." };

        const docCount = match._count?.documents || 0;
        if (docCount > 0) {
          return { message: "Tidak bisa ban \"" + match.name + "\": masih punya " + docCount + " dokumen." };
        }

        await api.delete("/users/" + match.id);
        return {
          message: "STAFF \"" + match.name.toUpperCase() + "\" BERHASIL DI-BAN! \nUser telah dihapus dari sistem.",
          effect: () => {
            const el = document.createElement("div");
            el.style.cssText = "position:fixed;inset:0;z-index:9999;pointer-events:none;display:flex;align-items:center;justify-content:center";
            el.innerHTML = "<div style='background:#ff4655;color:white;padding:24px 48px;font-size:24px;font-weight:900;letter-spacing:4px;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));animation:secret-ban-fade 2s ease forwards'>BANNED: " + match.name.toUpperCase() + "</div>";
            document.body.append(el);
            const style = document.createElement("style");
            style.id = "secret-ban-style";
            style.textContent = "@keyframes secret-ban-fade{0%{opacity:0;transform:scale(0.8)}30%{opacity:1;transform:scale(1.05)}60%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(0.9)}}";
            document.head.append(style);
            setTimeout(() => { el.remove(); document.getElementById("secret-ban-style")?.remove(); }, 2500);
          },
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return { message: "Gagal ban: " + msg };
      }
    },
  },
  {
    name: "/whoami",
    desc: "Info user yang sedang login",
    handler: () => {
      const token = localStorage.getItem("token");
      if (!token) return { message: "Tidak ada token. Belum login." };
      try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        const expDate = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : "N/A";
        return {
          message: [
            "ID: " + (payload.id || payload.sub || "N/A"),
            "Email: " + (payload.email || "N/A"),
            "Role: " + (payload.role || "N/A").toUpperCase(),
            "Expired: " + expDate,
          ].join("\n"),
        };
      } catch {
        return { message: "Gagal decode token." };
      }
    },
  },
  {
    name: "/token",
    desc: "Detail JWT token",
    handler: () => {
      const token = localStorage.getItem("token");
      if (!token) return { message: "Tidak ada token." };
      try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        const now = Date.now();
        const exp = payload.exp ? payload.exp * 1000 : 0;
        const sisa = exp ? Math.floor((exp - now) / 1000) : 0;
        const menit = Math.floor(sisa / 60);
        return {
          message: [
            "Token: " + token.slice(0, 30) + "...",
            "Role: " + (payload.role || "N/A"),
            "Exp: " + (payload.exp ? new Date(payload.exp * 1000).toLocaleString() : "N/A"),
            "Sisa: " + menit + " menit",
          ].join("\n"),
        };
      } catch {
        return { message: "Gagal decode token." };
      }
    },
  },
  {
    name: "/trash-stats",
    desc: "Jumlah dokumen di trash",
    handler: async () => {
      try {
        const res = await api.get("/settings/trash");
        const data = res.data as { rejected: number };
        return { message: "Dokumen rejected di trash: " + (data.rejected ?? 0) };
      } catch {
        return { message: "Gagal ambil stats trash." };
      }
    },
  },
];

export async function executeCommand(
  input: string,
): Promise<{ message: string; effect?: () => void } | null> {
  const parts = input.trim().split(/\s+/);
  const cmdName = parts[0].toLowerCase();
  const args = parts.slice(1);
  const cmd = commands.find((c) => c.name === cmdName);
  if (!cmd) return null;
  return cmd.handler(args);
}

export function getHelp(): string {
  return commands.map((c) => c.name + " -- " + c.desc).join("\n");
}

export default commands;
