import type { Notification } from "@/types/notification";

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
  History,
  Menu,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Button,
  Avatar,
  Tooltip,
  Drawer,
  useOverlayState,
} from "@heroui/react";

import { Logo } from "@/components/common/icons";
import { getRole, getUserFromToken } from "@/lib/auth";
import { notificationService } from "@/services/notification.service";

export const Sidebar: FC = () => {
  const role = getRole();
  const navigate = useNavigate();
  const user = getUserFromToken();

  const isAdmin = role === "ADMIN";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const drawerState = useOverlayState();
  const menuDrawerState = useOverlayState();

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
      href: isAdmin ? "/admin" : "/dashboard",
      roles: ["ADMIN", "STAFF"],
    },
    {
      icon: FileText,
      label: "Document Archive",
      href: "/archives",
      roles: ["ADMIN", "STAFF"],
    },
    {
      icon: ClipboardCheck,
      label: "Approvals",
      href: "/approvals",
      roles: ["ADMIN", "STAFF"],
    },
    {
      icon: Users,
      label: "Master Users",
      href: "/admin/users",
      roles: ["ADMIN"],
    },
    {
      icon: History,
      label: "Log Activity",
      href: "/admin/audit",
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
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex md:hidden items-center justify-between px-4 h-14 bg-content1/95 backdrop-blur-md border-b border-divider">
        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl text-default-500 hover:bg-default-100"
          onClick={() => menuDrawerState.open()}
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <Logo className="text-primary" size={24} />
          <span className="font-bold text-sm text-foreground">Archivio</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="relative flex items-center justify-center w-9 h-9 rounded-xl text-default-400 hover:bg-default-100 transition-colors"
            onClick={() => drawerState.toggle()}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <button
            className="flex items-center justify-center w-9 h-9 rounded-xl text-default-400 hover:text-danger hover:bg-danger/10 transition-colors"
            onClick={handleLogout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <Drawer state={menuDrawerState}>
        <Drawer.Backdrop isDismissable>
          <Drawer.Content placement="left">
            <Drawer.Dialog>
              <Drawer.Header>
                <div className="flex items-center gap-3">
                  <Logo className="text-primary" size={28} />
                  <div>
                    <p className="text-foreground font-bold text-sm">
                      Archivio
                    </p>
                    <p className="text-default-500 text-xs">
                      Management System
                    </p>
                  </div>
                </div>
                <Drawer.CloseTrigger />
              </Drawer.Header>
              <Drawer.Body>
                <p className="text-[10px] font-semibold text-default-400 uppercase px-2 mb-2">
                  Main Menu
                </p>
                <div className="flex flex-col gap-1">
                  {filteredItems.map((item) => (
                    <NavLink
                      key={item.href}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                          isActive
                            ? "bg-primary/15 text-primary shadow-sm shadow-primary/10"
                            : "text-default-500 hover:bg-default-100 hover:text-foreground"
                        }`
                      }
                      end={item.href === "/admin"}
                      to={item.href}
                      onClick={() => menuDrawerState.close()}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </Drawer.Body>
              <Drawer.Footer className="border-t border-divider">
                <div className="flex items-center justify-between w-full">
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
                  <Button
                    isIconOnly
                    className="text-default-400 hover:text-danger hover:bg-danger/10 rounded-xl"
                    variant="ghost"
                    onPress={handleLogout}
                  >
                    <LogOut size={18} />
                  </Button>
                </div>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      {/* Sidebar Desktop */}
      <aside className="w-64 border-r border-divider p-6 hidden md:flex flex-col gap-8 bg-background h-screen sticky top-0">
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
                      ? "backdrop-blur-md bg-white/30 dark:bg-white/[0.07] border border-white/30 dark:border-white/10 text-primary shadow-sm"
                      : "text-default-500 hover:backdrop-blur-sm hover:bg-white/20 dark:hover:bg-white/[0.05] hover:text-foreground"
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

          <div className="flex items-center gap-1">
            {/* Notification Bell */}
            <button
              className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 text-default-400 hover:backdrop-blur-md hover:bg-white/20 dark:hover:bg-white/[0.05] hover:text-foreground"
              onClick={() => drawerState.toggle()}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <Tooltip delay={0}>
              <Tooltip.Trigger>
                <Button
                  isIconOnly
                  className="text-default-400 hover:text-danger hover:bg-danger/10 hover:backdrop-blur-md rounded-xl"
                  variant="ghost"
                  onPress={handleLogout}
                >
                  <LogOut size={18} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Sign Out</Tooltip.Content>
            </Tooltip>
          </div>
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
                        <CheckCheck className="inline mr-1" size={14} />
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
    </>
  );
};
