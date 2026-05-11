import { Outlet } from "react-router-dom";

import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-background text-foreground transition-colors overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col p-2 md:p-4 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
