import type { LucideIcon } from "lucide-react";

import { FC, memo, useMemo } from "react";
import { Card, Chip } from "@heroui/react";
import { Files, Hourglass, ShieldCheck, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

export interface DashboardStats {
  total: number;
  pending: number;
  verified: number;
  thisMonth: number;
  thisMonthTrend?: number;
}

interface StatItem {
  label: string;
  value: number;
  Icon: LucideIcon;
  color: string;
  trend: string;
  isUp: boolean;
}

const StatsGrid: FC<{ stats: DashboardStats }> = memo(({ stats }) => {
  const items = useMemo<StatItem[]>(
    () => [
      {
        label: "Total Docs",
        value: stats.total,
        Icon: Files,
        color: "text-primary",
        trend: "+5.2%",
        isUp: true,
      },
      {
        label: "Pending",
        value: stats.pending,
        Icon: Hourglass,
        color: "text-warning",
        trend: "+2.1%",
        isUp: true,
      },
      {
        label: "Verified",
        value: stats.verified,
        Icon: ShieldCheck,
        color: "text-success",
        trend: "+12.5%",
        isUp: true,
      },
      {
        label: "This Month",
        value: stats.thisMonth,
        Icon: CalendarDays,
        color: "text-primary",
        trend:
          stats.thisMonthTrend !== undefined
            ? `${stats.thisMonthTrend >= 0 ? "+" : ""}${stats.thisMonthTrend}%`
            : "-",
        isUp: (stats.thisMonthTrend ?? 0) >= 0,
      },
    ],
    [stats],
  );

  return (
    <>
      {items.map(({ label, value, Icon, color, trend, isUp }) => (
        <Card
          key={label}
          className="border-none shadow-sm relative overflow-hidden group"
        >
          <div
            className={`absolute inset-0 opacity-[0.05] ${color.replace("text-", "bg-")} group-hover:opacity-[0.1] transition-opacity`}
          />
          <Card.Content className="px-4 py-4 flex items-center gap-3 relative z-10">
            <div
              className={`p-2 rounded-lg ${color.replace("text-", "bg-")}/10 ${color} shrink-0`}
            >
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-default-400 uppercase tracking-tighter truncate">
                {label}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <motion.h3
                  key={value}
                  animate={{ scale: [1, 1.05, 1] }}
                  className="text-lg font-bold text-foreground tabular-nums"
                  transition={{ duration: 0.3 }}
                >
                  {value}
                </motion.h3>
                <Chip
                  className="h-4 text-[9px] px-1 font-bold"
                  color={
                    trend === "Stable" ? "default" : isUp ? "success" : "danger"
                  }
                  size="sm"
                  variant="soft"
                >
                  {trend}
                </Chip>
              </div>
            </div>
          </Card.Content>
        </Card>
      ))}
    </>
  );
});

StatsGrid.displayName = "StatsGrid";
export default StatsGrid;
