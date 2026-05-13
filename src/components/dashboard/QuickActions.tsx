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
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Approval System",
      icon: ClipboardCheck,
      href: "/admin/approvals",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "System Settings",
      icon: Settings,
      href: "/admin/settings",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action, idx) => (
        <Link key={idx} to={action.href}>
          <Card className="bg-content1/50 border-divider hover:bg-default-100 transition-all cursor-pointer group shadow-none border">
            <Card.Content className="p-3 flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${action.bg} ${action.color} group-hover:scale-105 transition-transform shrink-0`}
              >
                <action.icon size={18} />
              </div>
              <span className="text-[11px] font-bold text-foreground/80 group-hover:text-primary transition-colors truncate">
                {action.label}
              </span>
            </Card.Content>
          </Card>
        </Link>
      ))}
    </div>
  );
};
