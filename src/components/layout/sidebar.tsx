import { FC, useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  Settings,
  Users,
  LogOut,
  Crown,
  User,
  Bell,
  CheckCheck,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button, Avatar, Tooltip, Drawer, useOverlayState } from "@heroui/react";

import { Logo } from "@/components/common/icons";
import { getRole, getUserFromToken } from "@/lib/auth";
import { notificationService } from "@/services/notification.service";
import type { Notification } from "@/types/notification";

export const Sidebar: FC = () => {
  const role = getRole();
  const navigate = useNavigate();
  const user = getUserFromToken();

  const isAdmin = role === "ADMIN";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const drawerState = useOverlayState();

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await notificationService.getAll();
      setNotifications(result.data);
      setUnreadCount(result.unreadCount);
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silent fail
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.deleteAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      // silent fail
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // silent fail
      }
    }
    navigate(`/approvals`);
    drawerState.close();
  };

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

        {/* Notification Bell */}
        <button
          className="group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium w-full text-default-500 hover:bg-default-100 hover:text-foreground"
          onClick={() => drawerState.toggle()}
        >
          <Bell size={18} />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto bg-danger text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
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

      <Drawer state={drawerState}>
        <Drawer.Backdrop isDismissable>
          <Drawer.Content placement="left">
            <Drawer.Dialog>
              <Drawer.Header>
                <Drawer.Heading>Notifications</Drawer.Heading>
                <Drawer.CloseTrigger />
              </Drawer.Header>
              <Drawer.Body>
                {notifications.length === 0 ? (
                  <div className="text-center text-sm text-default-400 py-8">
                    No notifications
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {notifications.map((notif) => (
                      <button
                        key={notif.id}
                        className={`w-full text-left px-3 py-3 rounded-xl hover:bg-default-100 transition-colors ${
                          !notif.isRead ? "bg-primary/5" : ""
                        }`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <p
                          className={`text-sm ${
                            !notif.isRead
                              ? "font-bold text-foreground"
                              : "text-default-500"
                          }`}
                        >
                          {notif.message}
                        </p>
                        <p className="text-xs text-default-400 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </Drawer.Body>
              {(notifications.length > 0 || unreadCount > 0) && (
                <Drawer.Footer className="flex justify-end gap-3">
                  {unreadCount > 0 && (
                    <button
                      className="text-xs text-primary font-semibold hover:underline"
                      onClick={handleMarkAllRead}
                    >
                      <CheckCheck size={14} className="inline mr-1" />
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      className="text-xs text-danger font-semibold hover:underline"
                      onClick={handleClearAll}
                    >
                      Clear all
                    </button>
                  )}
                </Drawer.Footer>
              )}
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </aside>
  );
};
