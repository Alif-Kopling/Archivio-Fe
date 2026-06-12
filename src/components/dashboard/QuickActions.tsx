import { FC } from "react";
import { Card } from "@heroui/react";
import { Users, ClipboardCheck, Settings, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const QuickActions: FC = () => {
  const actions = [
    {
      label: "Manage Users",
      icon: Users,
      href: "/admin/users",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Approval System",
      icon: ClipboardCheck,
      href: "/approvals",
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "System Settings",
      icon: Settings,
      href: "/admin/settings",
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Trash Bin",
      icon: Trash2,
      href: "/admin/settings?tab=trash",
      color: "text-danger",
      bg: "bg-danger/10",
    },
  ];

  return (
    <>
      {actions.map(({ label, icon: Icon, href, color, bg }, idx) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 + idx * 0.08, ease: "easeOut" }}
        >
          <Link className="block" to={href}>
            <Card className="border-none shadow-sm cursor-pointer group relative overflow-hidden hover:shadow-lg transition-all duration-500">
              <div
                className={`absolute inset-0 opacity-[0.03] ${bg} group-hover:opacity-[0.1] transition-all duration-500`}
              />
              <Card.Content className="p-2.5 flex items-center gap-3 relative z-10">
                <motion.div
                  className={`p-2 rounded-xl ${bg} ${color} shadow-sm shrink-0`}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon size={18} />
                </motion.div>
                <span className="text-[10px] font-bold text-default-600 group-hover:text-foreground transition-colors uppercase tracking-tight truncate">
                  {label}
                </span>
              </Card.Content>
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 shimmer-overlay" />
            </Card>
          </Link>
        </motion.div>
      ))}
    </>
  );
};