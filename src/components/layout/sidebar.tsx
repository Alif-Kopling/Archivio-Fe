import { FC } from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  Settings,
  Users,
  LogOut,
  Crown,
  User,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button, Avatar, Tooltip } from "@heroui/react";

import { Logo } from "@/components/common/icons";
import { getRole, getUserFromToken } from "@/lib/auth";

export const Sidebar: FC = () => {
  const role = getRole();
  const navigate = useNavigate();
  const user = getUserFromToken();

  const isAdmin = role === "ADMIN";

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/admin",
      roles: ["ADMIN"],
    },
    {
      icon: ClipboardCheck,
      label: "Approvals",
      href: "/approvals",
      roles: ["ADMIN", "STAFF"],
    },
    {
      icon: FileText,
      label: "Document Archive",
      href: "/archives",
      roles: ["ADMIN", "STAFF"],
    },
    {
      icon: Users,
      label: "Master Users",
      href: "/admin/users",
      roles: ["ADMIN"],
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/admin/settings",
      roles: ["ADMIN"],
    },
  ];

  const filteredItems = menuItems.filter(
    (item) => !role || item.roles.includes(role),
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <aside className="w-64 border-r border-divider p-6 hidden md:flex flex-col gap-8 bg-content1/50 backdrop-blur-sm h-screen sticky top-0">
      <div className="flex items-center gap-3 px-2">
        <Logo className="text-primary" size={32} />
        <div>
          <p className="text-foreground font-bold text-sm">Archivio</p>
          <p className="text-default-500 text-xs">Management System</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        <p className="text-[10px] font-semibold text-default-400 uppercase px-2 mb-2">
          Main Menu
        </p>
        {filteredItems.map((item) => {
          const isDashboard = item.href === "/admin";

          return (
            <NavLink
              key={item.href}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? "bg-primary/15 text-primary shadow-sm shadow-primary/10"
                    : "text-default-500 hover:bg-default-100 hover:text-foreground"
                }`
              }
              end={isDashboard}
              to={item.href}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full animate-in fade-in slide-in-from-left-2 duration-300" />
                  )}
                  <item.icon
                    className={`transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                    size={18}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Section with User Info & Logout */}
      <div className="mt-auto pt-6 border-t border-divider flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar
            className={`${isAdmin ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"} font-bold text-xs shrink-0`}
            size="sm"
          >
            <Avatar.Fallback>
              {isAdmin ? (
                <Crown size={16} strokeWidth={2.5} />
              ) : (
                <User size={16} strokeWidth={2.5} />
              )}
            </Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-bold text-foreground truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-default-400 font-medium truncate">
              {role}
            </p>
          </div>
        </div>

        <Tooltip delay={0}>
          <Tooltip.Trigger>
            <Button
              isIconOnly
              className="text-default-400 hover:text-danger hover:bg-danger/10 rounded-xl"
              variant="ghost"
              onPress={handleLogout}
            >
              <LogOut size={18} />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>Sign Out</Tooltip.Content>
        </Tooltip>
      </div>
    </aside>
  );
};
