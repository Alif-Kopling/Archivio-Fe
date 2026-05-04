import { FC } from "react";
import { LayoutDashboard, FileText, Settings, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Logo } from "@/components/icons";
import { getRole } from "@/lib/auth";

export const Sidebar: FC = () => {
  const role = getRole();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/admin",
      roles: ["ADMIN"],
    },
    {
      icon: Users,
      label: "Master Users",
      href: "/admin/users",
      roles: ["ADMIN"],
    },
    {
      icon: FileText,
      label: "Document Archive",
      href: "/archives",
      roles: ["ADMIN", "STAFF"],
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/admin/settings",
      roles: ["ADMIN", "STAFF"],
    },
  ];

  const filteredItems = menuItems.filter(
    (item) => !role || item.roles.includes(role),
  );

  return (
    <aside className="w-64 border-r border-divider p-6 hidden md:flex flex-col gap-8 bg-content1/50 backdrop-blur-sm h-screen sticky top-0">
      <div className="flex items-center gap-3 px-2">
        <Logo className="text-primary" size={32} />
        <div>
          <p className="text-foreground font-bold text-sm">Archivio</p>
          <p className="text-default-500 text-xs">Management System</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold text-default-400 uppercase px-2 mb-2">
          Main Menu
        </p>
        {filteredItems.map((item) => {
          return (
            <NavLink
              key={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-xl transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-default-500 hover:bg-default-100 hover:text-foreground"
                }`
              }
              to={item.href}
            >
              <item.icon size={18} /> {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
