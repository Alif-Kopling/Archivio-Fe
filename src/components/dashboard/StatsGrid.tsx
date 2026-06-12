import type { LucideIcon } from "lucide-react";

import { FC, memo, useMemo, useEffect, useState, useRef } from "react";
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

function useCountUp(end: number, duration = 700, enabled = true) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!enabled || started.current) return;
    started.current = true;

    let start: number | null = null;
    const raf = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setCount(Math.floor(eased * end));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [end, duration, enabled]);

  return count;
}

interface StatItem {
  label: string;
  value: number;
  Icon: LucideIcon;
  color: string;
  trend: string;
  isUp: boolean;
}

const StatCardItem: FC<{ item: StatItem; index: number }> = ({ item, index }) => {
  const { label, value, Icon, color, trend, isUp } = item;
  const count = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="border-none shadow-sm relative overflow-hidden group h-full hover:shadow-lg transition-all duration-500">
        <div
          className={`absolute inset-0 opacity-[0.03] ${color.replace("text-", "bg-")} group-hover:opacity-[0.12] transition-all duration-500`}
        />
        <div className="absolute inset-x-0 bottom-0 h-0.5">
          <div
            className={`h-full ${color.replace("text-", "bg-")} transition-all duration-700`}
            style={{ width: `${Math.min((value / (value || 1)) * 100, 100)}%` }}
          />
        </div>
        <Card.Content className="px-4 py-4 flex items-center gap-3 relative z-10">
          <div className="relative shrink-0">
            <div
              className={`p-2 rounded-lg ${color.replace("text-", "bg-")}/10 ${color} relative z-10 group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon size={18} />
            </div>
            <div
              className={`absolute inset-0 rounded-lg ${color.replace("text-", "bg-")}/20 blur-xl group-hover:blur-2xl transition-all duration-500 scale-150`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-default-400 uppercase tracking-tighter truncate">
              {label}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <motion.h3
                key={value}
                className="text-lg font-bold text-foreground tabular-nums"
              >
                {count}
              </motion.h3>
              <Chip
                className="h-4 text-[9px] px-1 font-bold"
                color={trend === "Stable" ? "default" : isUp ? "success" : "danger"}
                size="sm"
                variant="soft"
              >
                {trend}
              </Chip>
            </div>
          </div>
        </Card.Content>
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 shimmer-overlay" />
      </Card>
    </motion.div>
  );
};

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
      {items.map((item, i) => (
        <StatCardItem key={item.label} item={item} index={i} />
      ))}
    </>
  );
});

StatsGrid.displayName = "StatsGrid";
export default StatsGrid;