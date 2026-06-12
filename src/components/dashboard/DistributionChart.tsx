import type { DashboardStats } from "@/components/dashboard/StatsGrid";

import { FC, memo, useMemo } from "react";
import { Card } from "@heroui/react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, FileText } from "lucide-react";

interface RowConfig {
  label: string;
  count: number;
  pct: number;
  color: string;
  dot: string;
  gradient: string;
  Icon: typeof Clock;
}

const DistributionChart: FC<{ stats: DashboardStats }> = memo(({ stats }) => {
  const rows = useMemo<RowConfig[]>(() => {
    const total = stats.total || 1;

    return [
      {
        label: "Pending",
        count: stats.pending,
        pct: (stats.pending / total) * 100,
        color: "bg-warning",
        dot: "bg-warning",
        gradient: "from-warning-300 to-warning-500",
        Icon: Clock,
      },
      {
        label: "Verified",
        count: stats.verified,
        pct: (stats.verified / total) * 100,
        color: "bg-success",
        dot: "bg-success",
        gradient: "from-success-300 to-success-500",
        Icon: CheckCircle,
      },
      {
        label: "Total",
        count: stats.total,
        pct: 100,
        color: "bg-primary",
        dot: "bg-primary",
        gradient: "from-primary-300 to-primary-500",
        Icon: FileText,
      },
    ];
  }, [stats]);

  return (
    <Card className="border-divider shadow-sm flex flex-col h-full overflow-hidden group">
      <Card.Content className="p-3 flex flex-col h-full">
        <div className="flex justify-between items-center mb-3 shrink-0">
          <div>
            <h4 className="font-bold text-xs">Distribution</h4>
            <p className="text-default-400 text-[9px]">
              Document status breakdown
            </p>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <div className="flex flex-col justify-center h-full gap-2.5">
            <div className="grid grid-cols-[1fr_44px_48px] gap-x-2 text-[9px] font-bold text-default-400 uppercase tracking-wider px-2 mb-0.5">
              <span>Status</span>
              <span className="text-right">Count</span>
              <span className="text-right">%</span>
            </div>
            {rows.map((r, idx) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.1 + idx * 0.12, ease: "easeOut" }}
                className="group/row"
              >
                <div className="grid grid-cols-[1fr_44px_48px] gap-x-2 items-center px-2 py-1.5 rounded-lg hover:bg-default-100/50 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${r.dot} group-hover/row:animate-pulse`} />
                    <r.Icon size={11} className="text-default-400 group-hover/row:hidden shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate">
                      {r.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-foreground tabular-nums text-right">
                    {r.count}
                  </span>
                  <span className="text-xs font-semibold text-default-500 tabular-nums text-right">
                    {r.pct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-default-100 mx-2 overflow-hidden relative">
                  <motion.div
                    animate={{ width: `${r.pct}%` }}
                    className={`h-full rounded-full ${r.color} relative`}
                    initial={{ width: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 + idx * 0.12, ease: "easeOut" }}
                  >
                    <div className="absolute inset-0 rounded-full shimmer-overlay" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
});

DistributionChart.displayName = "DistributionChart";
export default DistributionChart;