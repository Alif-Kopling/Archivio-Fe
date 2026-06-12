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
  ChevronLeft,
  FolderArchive,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Button,
  Avatar,
  Tooltip,
  Drawer,
  useOverlayState,
} from "@heroui/react";
import { motion } from "framer-motion";

import { Logo } from "@/components/common/icons";
import { getRole, getUserFromToken } from "@/lib/auth";
import { notificationService } from "@/services/notification.service";

const COLLAPSED_KEY = "archivio-sidebar-collapsed";

function useLocalStorageState(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(defaultValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) setValue(stored === "true");
    } catch {}
    setReady(true);
  }, [key]);

  const setStoredValue = (next: boolean) => {
    setValue(next);
    try {
      localStorage.setItem(key, String(next));
    } catch {}
  };

  return [value, setStoredValue, ready] as const;
}

export const Sidebar: FC = () => {
  const role = getRole();
  const navigate = useNavigate();
  const user = getUserFromToken();
  const isAdmin = role === "ADMIN";

  const [collapsed, setCollapsed, ready] = useLocalStorageState(COLLAPSED_KEY, false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const drawerState = useOverlayState();
  const menuDrawerState = useOverlayState();

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await notificationService.getAll();
      setNotifications(result.data);
      setUnreadCount(result.unreadCount);
    } catch {}
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
    } catch {}
  };

  const handleClearAll = async () => {
    try {
      await notificationService.deleteAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {}
    }
    navigate("/approvals");
    drawerState.close();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const mainMenuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: isAdmin ? "/admin" : "/dashboard",
    },
    {
      icon: FolderArchive,
      label: "Document Archive",
      href: "/archives/surat-masuk",
    },
    {
      icon: ClipboardCheck,
      label: "Approvals",
      href: "/approvals",
    },
  ];

  const adminMenuItems = [
    { icon: Users, label: "Master Users", href: "/admin/users" },
    { icon: History, label: "Log Activity", href: "/admin/audit" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const Text: FC<{ show: boolean; className?: string; children: React.ReactNode }> = ({
    show,
    className = "",
    children,
  }) => (
    <div
      className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${
        show ? "w-auto opacity-100 delay-75" : "w-0 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );

  const NavItem: FC<{
    item: { icon: FC<{ size?: number }>; label: string; href: string };
  }> = ({ item }) => {
    const Icon = item.icon;
    const isDashboard = item.href === "/admin" || item.href === "/dashboard";

    return (
      <NavLink end={isDashboard} to={item.href} className="block">
        {({ isActive }) => (
          <div className="relative">
            {isActive && (
              <motion.div
                layoutId="active"
                className="absolute inset-0 rounded-xl bg-primary/10 dark:bg-primary/15 border border-primary/20"
                transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.5 }}
              />
            )}
            <div className="relative z-10 flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200">
              {collapsed ? (
                <Tooltip content={item.label} delay={300} placement="right">
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-default-400"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                </Tooltip>
              ) : (
                <>
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200 shrink-0 ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-default-400"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors duration-200 ${
                      isActive ? "text-primary font-semibold" : "text-default-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </NavLink>
    );
  };

  if (!ready) {
    return (
      <>
        {/* Mobile spacer */}
        <div className="md:hidden h-14" />
        {/* Desktop spacer */}
        <aside className="hidden md:flex w-64 shrink-0" />
      </>
    );
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex md:hidden items-center justify-between px-4 h-14 bg-content1/95 backdrop-blur-xl border-b border-divider">
        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl text-default-500 hover:bg-default-100 transition-colors"
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

      {/* Mobile Drawer */}
      <Drawer state={menuDrawerState}>
        <Drawer.Backdrop isDismissable>
          <Drawer.Content placement="left">
            <Drawer.Dialog>
              <Drawer.Header>
                <div className="flex items-center gap-3">
                  <Logo className="text-primary" size={28} />
                  <div>
                    <p className="text-foreground font-bold text-sm">Archivio</p>
                    <p className="text-default-500 text-xs">Management System</p>
                  </div>
                </div>
                <Drawer.CloseTrigger />
              </Drawer.Header>
              <Drawer.Body>
                <p className="text-[10px] font-semibold text-default-400 uppercase px-2 mb-2">Main Menu</p>
                <div className="flex flex-col gap-1">
                  {[...mainMenuItems, ...(isAdmin ? adminMenuItems : [])].map((item) => (
                    <NavLink
                      key={item.href}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                          isActive
                            ? "bg-primary/15 text-primary shadow-sm shadow-primary/10"
                            : "text-default-500 hover:bg-default-100 hover:text-foreground"
                        }`
                      }
                      end={item.href === "/admin" || item.href === "/dashboard"}
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
                        {isAdmin ? <Crown size={16} strokeWidth={2.5} /> : <User size={16} strokeWidth={2.5} />}
                      </Avatar.Fallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{user?.name || "User"}</p>
                      <p className="text-[10px] text-default-400 font-medium truncate">{role}</p>
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

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-background/80 backdrop-blur-xl border-r border-divider h-screen sticky top-0 overflow-hidden shrink-0 will-change-[width] transition-[width] duration-300 ease-out ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {/* Logo */}
        <div
          className={`flex items-center border-b border-divider shrink-0 transition-all duration-300 ${
            collapsed ? "justify-center px-3 py-5" : "px-6 py-5 gap-3"
          }`}
        >
          <Logo className="text-primary shrink-0" size={collapsed ? 24 : 28} />
          <Text show={!collapsed}>
            <p className="text-foreground font-bold text-sm">Archivio</p>
            <p className="text-default-500 text-[10px]">Management System</p>
          </Text>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col gap-5 py-4 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-1">
            <p
              className={`text-[10px] font-semibold text-default-400 uppercase tracking-wider px-4 transition-opacity duration-200 ${
                collapsed ? "opacity-0" : "opacity-100"
              }`}
            >
              Main
            </p>
            <div className="flex flex-col gap-0.5 px-2 mt-1">
              {mainMenuItems.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-col gap-1">
              <p
                className={`text-[10px] font-semibold text-default-400 uppercase tracking-wider px-4 transition-opacity duration-200 ${
                  collapsed ? "opacity-0" : "opacity-100"
                }`}
              >
                Admin
              </p>
              <div className="flex flex-col gap-0.5 px-2 mt-1">
                {adminMenuItems.map((item) => (
                  <NavItem key={item.href} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-divider shrink-0">
          {/* Toggle */}
          <div className={`flex ${collapsed ? "justify-center py-2" : "justify-end px-3 py-1"}`}>
            <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"} delay={300} placement="right">
              <button
                className="flex items-center justify-center w-7 h-7 rounded-lg text-default-400 hover:text-foreground hover:bg-default-100 transition-all duration-200"
                onClick={() => setCollapsed(!collapsed)}
              >
                <ChevronLeft
                  size={14}
                  className={`transition-transform duration-300 ease-out ${collapsed ? "rotate-180" : ""}`}
                />
              </button>
            </Tooltip>
          </div>

          <div
            className={`flex items-center py-3 transition-all duration-300 ${
              collapsed ? "justify-center flex-col gap-2 px-2" : "justify-between px-4 gap-2"
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              <div className="relative shrink-0">
                <Avatar
                  className={`${isAdmin ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"} font-bold text-xs shrink-0`}
                  size="sm"
                >
                  <Avatar.Fallback>
                    {isAdmin ? <Crown size={16} strokeWidth={2.5} /> : <User size={16} strokeWidth={2.5} />}
                  </Avatar.Fallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-background animate-breathing" />
              </div>
              <Text show={!collapsed}>
                <p className="text-xs font-bold text-foreground truncate">{user?.name || "User"}</p>
                <p className="text-[10px] text-default-400 font-medium truncate">{role}</p>
              </Text>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {collapsed ? (
                <>
                  <Tooltip content="Notifications" delay={300} placement="right">
                    <button
                      className="relative flex items-center justify-center w-8 h-8 rounded-lg text-default-400 hover:text-foreground hover:bg-default-100 transition-all duration-200"
                      onClick={() => drawerState.toggle()}
                    >
                      <Bell size={16} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-1">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </button>
                  </Tooltip>
                  <Tooltip content="Sign Out" delay={300} placement="right">
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-default-400 hover:text-danger hover:bg-danger/10 transition-all duration-200"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                    </button>
                  </Tooltip>
                </>
              ) : (
                <Text show={!collapsed}>
                  <div className="flex items-center gap-1">
                    <Tooltip content="Notifications" delay={300}>
                      <button
                        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-default-400 hover:text-foreground hover:bg-default-100 transition-all duration-200"
                        onClick={() => drawerState.toggle()}
                      >
                        <Bell size={16} />
                        {unreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-1">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </button>
                    </Tooltip>
                    <Tooltip content="Sign Out" delay={300}>
                      <button
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-default-400 hover:text-danger hover:bg-danger/10 transition-all duration-200"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                      </button>
                    </Tooltip>
                  </div>
                </Text>
              )}
            </div>
          </div>
        </div>

        {/* Notification Drawer */}
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
                    <div className="text-center text-sm text-default-400 py-8">No notifications</div>
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
                          <p className={`text-sm ${!notif.isRead ? "font-bold text-foreground" : "text-default-500"}`}>
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
                      <button className="text-xs text-primary font-semibold hover:underline" onClick={handleMarkAllRead}>
                        <CheckCheck className="inline mr-1" size={14} /> Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button className="text-xs text-danger font-semibold hover:underline" onClick={handleClearAll}>
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