import { Outlet } from "react-router-dom";

import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-background bg-gradient-to-br from-primary/15 via-background to-secondary/15 text-foreground transition-colors overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col p-2 md:p-4 pt-14 md:pt-4 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
