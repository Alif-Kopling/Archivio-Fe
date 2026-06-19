import { ClipboardCheck, Clock, AlertTriangle } from "lucide-react";
import { FC, useMemo } from "react";

export const ApprovalHeader: FC<{ total: number }> = ({ total }) => {
  const stats = useMemo(
    () => [
      {
        label: "Pending",
        value: total,
        Icon: Clock,
        color: "text-warning",
        bg: "bg-warning/10",
      },
      {
        label: "Urgent",
        value: Math.max(0, total - 3),
        Icon: AlertTriangle,
        color: "text-danger",
        bg: "bg-danger/10",
      },
    ],
    [total],
  );

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-primary/20 text-primary backdrop-blur-sm shadow-inner">
          <ClipboardCheck size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Approval System
          </h1>
          <p className="text-default-500 text-sm">
            Review and verify incoming documents for the archive.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {stats.map(({ label, value, Icon, color, bg }) => (
          <div
            key={label}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${bg} ${color}`}
          >
            <Icon size={14} />
            <span className="text-[11px] font-bold">
              {value} {label}
            </span>
          </div>
        ))}
      </div>
    </header>
  );
};
