import { FC } from "react";
import { Card } from "@heroui/react";
import { Users, ClipboardCheck, Settings, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

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
      {actions.map(({ label, icon: Icon, href, color, bg }) => (
        <Link key={label} className="block" to={href}>
          <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 relative overflow-hidden">
            <div
              className={`absolute inset-0 opacity-[0.03] ${bg} group-hover:opacity-[0.08] transition-opacity`}
            />
            <Card.Content className="p-2.5 flex items-center gap-3 relative z-10">
              <div
                className={`p-2 rounded-xl ${bg} ${color} group-hover:scale-110 transition-all duration-300 shadow-sm shrink-0`}
              >
                <Icon size={18} />
              </div>
              <span className="text-[10px] font-bold text-default-600 group-hover:text-foreground transition-colors uppercase tracking-tight truncate">
                {label}
              </span>
            </Card.Content>
          </Card>
        </Link>
      ))}
    </>
  );
};
