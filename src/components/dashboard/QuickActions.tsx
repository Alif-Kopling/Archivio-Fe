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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map(({ label, icon: Icon, href, color, bg }) => (
        <Link key={label} to={href}>
          <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group hover:-translate-y-0.5">
            <Card.Content className="p-4 flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${bg} ${color} group-hover:scale-105 transition-transform shrink-0`}
              >
                <Icon size={20} />
              </div>
              <span className="text-sm font-semibold text-default-700 group-hover:text-foreground transition-colors truncate">
                {label}
              </span>
            </Card.Content>
          </Card>
        </Link>
      ))}
    </div>
  );
};
