/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
import { FC, memo, useEffect, useMemo, useState, useCallback } from "react";
import {
  Card,
  Button,
  Chip,
} from "@heroui/react";
import {
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Files,
  Hourglass,
  ShieldCheck,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

import api from "@/lib/axios";
import { ThemeSwitch } from "@/components/common/theme-switch";
import { QuickActions } from "@/components/dashboard/QuickActions";

interface Stats {
  total: number;
  pending: number;
  verified: number;
}

interface StatItem {
  label: string;
  value: number | string;
  Icon: typeof Files;
  color: string;
  trend: string;
  isUp: boolean;
  isTextValue?: boolean;
}

const Header: FC = () => (
  <header className="flex flex-row justify-between items-center gap-4">
    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
    <div className="flex items-center gap-1">
      <Button
        isIconOnly
        aria-label="Notifications"
        className="text-default-500"
        variant="ghost"
      >
        <Bell size={18} />
      </Button>
      <ThemeSwitch />
    </div>
  </header>
);

const StatsGrid: FC<{ stats: Stats }> = memo(({ stats }) => {
  const items = useMemo<StatItem[]>(
    () => [
      { label: "Total Documents", value: stats.total, Icon: Files, color: "text-primary", trend: "+5.2%", isUp: true },
      { label: "Pending Approval", value: stats.pending, Icon: Hourglass, color: "text-warning", trend: "+2.1%", isUp: true },
      { label: "Verified Archives", value: stats.verified, Icon: ShieldCheck, color: "text-success", trend: "+12.5%", isUp: true },
      { label: "System Status", value: "Online", Icon: Activity, color: "text-secondary", trend: "Stable", isUp: true, isTextValue: true },
    ],
    [stats],
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ label, value, Icon, color, trend, isUp, isTextValue }) => (
        <Card
          key={label}
          className="border-none shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
        >
          <div
            className={`absolute inset-0 opacity-[0.07] ${color.replace("text-", "bg-")} group-hover:opacity-[0.12] transition-opacity`}
          />
          <Card.Content className="px-5 py-4 flex items-center gap-4 relative z-10">
            <div
              className={`p-3 rounded-xl ${color.replace("text-", "bg-")}/10 ${color} shrink-0`}
            >
              <Icon size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-default-500 uppercase tracking-wider">
                {label}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {isTextValue ? (
                  <span className="text-2xl font-extrabold text-foreground">
                    {value as string}
                  </span>
                ) : (
                  <motion.h3
                    key={value as number}
                    animate={{ scale: [1, 1.1, 1] }}
                    className="text-2xl font-extrabold text-foreground tabular-nums"
                    initial={false}
                    transition={{ duration: 0.3 }}
                  >
                    {value}
                  </motion.h3>
                )}
                <Chip
                  className="text-[11px] font-semibold gap-0.5"
                  color={trend === "Stable" ? "default" : isUp ? "success" : "danger"}
                  size="sm"
                  variant="soft"
                >
                  {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {trend}
                </Chip>
              </div>
            </div>
          </Card.Content>
        </Card>
      ))}
    </div>
  );
});

StatsGrid.displayName = "StatsGrid";

const ChartTooltip: FC<{
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-content1 shadow-sm border border-divider rounded-xl py-2 px-3">
      <p className="text-xs text-default-500 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-foreground">{payload[0].value}</p>
    </div>
  );
};

const ChartsSection: FC<{ stats: Stats }> = memo(({ stats }) => {
  const barData = useMemo(
    () => [
      { name: "Pending", count: stats.pending, fill: "#f5a524" },
      { name: "Verified", count: stats.verified, fill: "#17c964" },
      { name: "Total", count: stats.total, fill: "#006fee" },
    ],
    [stats],
  );

  const lineData = useMemo(
    () => [
      { name: "Mon", v: Math.floor(stats.total * 0.2) },
      { name: "Tue", v: Math.floor(stats.total * 0.5) },
      { name: "Wed", v: Math.floor(stats.total * 0.3) },
      { name: "Thu", v: Math.floor(stats.total * 0.7) },
      { name: "Fri", v: stats.total },
    ],
    [stats.total],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-divider shadow-sm">
        <Card.Content className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-bold text-lg">Archive Statistics</h4>
              <p className="text-default-500 text-sm">
                Status document distribution
              </p>
            </div>
            <Chip color="default" variant="soft">Overview</Chip>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={barData}>
                <CartesianGrid
                  className="stroke-default-200"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  className="text-xs font-semibold"
                  dataKey="name"
                  tickLine={false}
                />
                <RechartsTooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Bar barSize={50} dataKey="count" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card.Content>
      </Card>

      <Card className="border-divider shadow-sm">
        <Card.Content className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-bold text-lg">Weekly Activity</h4>
              <p className="text-default-500 text-sm">
                Document upload trend
              </p>
            </div>
            <Chip color="accent" variant="soft">Live</Chip>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={lineData}>
                <CartesianGrid
                  className="stroke-default-200"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  className="text-xs font-semibold"
                  dataKey="name"
                  tickLine={false}
                />
                <RechartsTooltip content={<ChartTooltip />} />
                <Line
                  activeDot={{ r: 6, fill: "#006fee" }}
                  dataKey="v"
                  dot={{ r: 4, fill: "#006fee" }}
                  stroke="#006fee"
                  strokeWidth={3}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
});

ChartsSection.displayName = "ChartsSection";

const DashboardSkeleton: FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-none shadow-sm">
          <Card.Content className="px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-default-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-default-200 animate-pulse rounded" />
              <div className="h-7 w-16 bg-default-200 animate-pulse rounded" />
            </div>
          </Card.Content>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="border-divider shadow-sm">
          <Card.Content className="p-6">
            <div className="h-5 w-36 bg-default-200 animate-pulse rounded mb-4" />
            <div className="h-64 bg-default-200 animate-pulse rounded-lg" />
          </Card.Content>
        </Card>
      ))}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    verified: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard");
      const payload = response.data ?? {};

      setStats({
        total: Number(payload.stats?.total || 0),
        pending: Number(payload.stats?.pending || 0),
        verified: Number(payload.stats?.verified || 0),
      });
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="p-6 overflow-y-auto h-full space-y-6">
      <Header />
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <StatsGrid stats={stats} />
          <ChartsSection stats={stats} />
          <QuickActions />
        </>
      )}
    </div>
  );
}
