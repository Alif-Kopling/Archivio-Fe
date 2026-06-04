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
  Files,
  Hourglass,
  ShieldCheck,
  Activity,
  Users,
  TrendingUp,
  Trophy,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";

import api from "@/lib/axios";
import { ThemeSwitch } from "@/components/common/theme-switch";
import { QuickActions } from "@/components/dashboard/QuickActions";

interface MonitoringData {
  activeStaff: Array<{ userId: number; createdAt: string; user: { name: string; role: string } }>;
  storageGrowth: Array<{ date: string; count: number }>;
  leaderboard: Array<{ count: number; user: { name: string } }>;
}

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

// ─── Header ──────────────────────────────────────────────────────────────────
const Header: FC = () => (
  <header className="flex flex-row justify-between items-center shrink-0 h-10">
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
        <Activity size={16} />
      </div>
      <h1 className="text-base font-bold tracking-tight">System Control Center</h1>
    </div>
    <div className="flex items-center gap-1">
      <Button
        isIconOnly
        aria-label="Notifications"
        className="text-default-500"
        size="sm"
        variant="ghost"
      >
        <Bell size={15} />
      </Button>
      <ThemeSwitch />
    </div>
  </header>
);

// ─── Stats Grid (top row, 4 cards) ───────────────────────────────────────────
const StatsGrid: FC<{ stats: Stats }> = memo(({ stats }) => {
  const items = useMemo<StatItem[]>(
    () => [
      { label: "Total Docs",  value: stats.total,   Icon: Files,      color: "text-primary",   trend: "+5.2%",  isUp: true },
      { label: "Pending",     value: stats.pending,  Icon: Hourglass,  color: "text-default-500",   trend: "+2.1%",  isUp: true },
      { label: "Verified",    value: stats.verified, Icon: ShieldCheck,color: "text-default-500", trend: "+12.5%", isUp: true },
      { label: "Status",      value: "Online",       Icon: Activity,   color: "text-secondary", trend: "Stable", isUp: true, isTextValue: true },
    ],
    [stats],
  );

  return (
    <>
      {items.map(({ label, value, Icon, color, trend, isUp, isTextValue }) => (
        <Card key={label} className="border-none shadow-sm relative overflow-hidden group">
          <div className={`absolute inset-0 opacity-[0.05] ${color.replace("text-", "bg-")} group-hover:opacity-[0.1] transition-opacity`} />
          <Card.Content className="px-4 py-4 flex items-center gap-3 relative z-10">
            <div className={`p-2 rounded-lg ${color.replace("text-", "bg-")}/10 ${color} shrink-0`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-default-400 uppercase tracking-tighter truncate">{label}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {isTextValue ? (
                  <span className="text-lg font-bold text-foreground">{value as string}</span>
                ) : (
                  <motion.h3
                    key={value as number}
                    animate={{ scale: [1, 1.05, 1] }}
                    className="text-lg font-bold text-foreground tabular-nums"
                    transition={{ duration: 0.3 }}
                  >
                    {value}
                  </motion.h3>
                )}
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
        </Card>
      ))}
    </>
  );
});
StatsGrid.displayName = "StatsGrid";

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
const ChartTooltip: FC<{
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-content1 shadow-sm border border-divider rounded-lg py-1 px-2">
      <p className="text-[10px] text-default-500">{label}</p>
      <p className="text-xs font-bold text-foreground">{payload[0].value}</p>
    </div>
  );
};

// ─── Bar Chart — Document Distribution ───────────────────────────────────────
const DistributionChart: FC<{ stats: Stats }> = memo(({ stats }) => {
  const barData = useMemo(
    () => [
      { name: "Pending",  count: stats.pending,  fill: "#f5a524" },
      { name: "Verified", count: stats.verified, fill: "#17c964" },
      { name: "Total",    count: stats.total,    fill: "#006fee" },
    ],
    [stats],
  );

  return (
    <Card className="border-divider shadow-sm flex flex-col h-full">
      <Card.Content className="p-3 flex flex-col h-full">
        <div className="flex justify-between items-center mb-2 shrink-0">
          <div>
            <h4 className="font-bold text-xs">Distribution</h4>
            <p className="text-default-400 text-[9px]">Document status</p>
          </div>
          <Chip className="h-4 text-[9px]" color="default" size="sm" variant="soft">Overview</Chip>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid className="stroke-default-100" strokeDasharray="3 3" vertical={false} />
              <XAxis axisLine={false} className="text-[9px] font-semibold" dataKey="name" tickLine={false} />
              <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: "transparent" }} />
              <Bar barSize={32} dataKey="count" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card.Content>
    </Card>
  );
});
DistributionChart.displayName = "DistributionChart";

// ─── Area Chart — Storage Growth ─────────────────────────────────────────────
const GrowthChart: FC<{ data: MonitoringData["storageGrowth"] }> = ({ data }) => (
  <Card className="border-divider shadow-sm flex flex-col h-full">
    <Card.Content className="p-3 flex flex-col h-full">
      <div className="flex justify-between items-center mb-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-lg bg-secondary/10 text-secondary">
            <TrendingUp size={14} />
          </div>
          <h4 className="font-bold text-xs">Growth</h4>
        </div>
        <Chip className="h-4 text-[9px]" color="default" size="sm" variant="soft">7 Days</Chip>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%"  stopColor="#9353d3" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9353d3" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid className="stroke-default-100" strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false} className="text-[9px]" dataKey="date"
              tickFormatter={(v) => v.split("-").slice(2).join("/")}
              tickLine={false}
            />
            <RechartsTooltip content={<ChartTooltip />} />
            <Area dataKey="count" fill="url(#colorCount)" fillOpacity={1} stroke="#9353d3" strokeWidth={2} type="monotone" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card.Content>
  </Card>
);

// ─── Active Staff ─────────────────────────────────────────────────────────────
const ActiveStaff: FC<{ data: MonitoringData["activeStaff"] }> = ({ data }) => (
  <Card className="border-divider shadow-sm h-full flex flex-col">
    <Card.Content className="p-3 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <Users className="text-primary" size={14} />
        <h4 className="font-bold text-xs">Active Staff</h4>
      </div>
      <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
        {data.slice(0, 4).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-default-100 flex items-center justify-center font-bold text-[10px] text-default-600 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                {item.user?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-medium truncate max-w-[100px]">{item.user?.name}</p>
                <p className="text-[9px] text-default-400 truncate max-w-[100px]">{item.user?.role}</p>
              </div>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
          </div>
        ))}
      </div>
    </Card.Content>
  </Card>
);

// ─── Leaderboard ──────────────────────────────────────────────────────────────
const Leaderboard: FC<{ data: MonitoringData["leaderboard"] }> = ({ data }) => (
  <Card className="border-divider shadow-sm h-full flex flex-col">
    <Card.Content className="p-3 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <Trophy className="text-warning" size={14} />
        <h4 className="font-bold text-xs">Top Contributors</h4>
      </div>
      <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
        {data.slice(0, 4).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-extrabold w-4 ${idx === 0 ? "text-warning" : idx === 1 ? "text-default-400" : idx === 2 ? "text-orange-400" : "text-default-300"}`}>
                #{idx + 1}
              </span>
              <p className="text-xs font-medium truncate max-w-[100px]">{item.user?.name}</p>
            </div>
            <Chip className="h-4 text-[9px] font-bold px-1" color="accent" size="sm" variant="soft">
              {item.count}
            </Chip>
          </div>
        ))}
      </div>
    </Card.Content>
  </Card>
);

// ─── System Health Badge ──────────────────────────────────────────────────────
const HealthBadge: FC = () => (
  <Card className="border-none bg-primary/5 shrink-0">
    <Card.Content className="p-3 flex items-center justify-between">
      <div>
        <p className="text-[9px] font-bold text-primary uppercase tracking-widest">System Health</p>
        <h5 className="font-bold text-sm">Operational</h5>
      </div>
      <div className="flex gap-1 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-success opacity-40" />
      </div>
    </Card.Content>
  </Card>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const DashboardSkeleton: FC = () => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="h-[100px] bg-default-100 animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-3 h-[400px] bg-default-100 animate-pulse rounded-xl" />
      <div className="lg:col-span-5 h-[400px] bg-default-100 animate-pulse rounded-xl" />
      <div className="lg:col-span-4 h-[400px] bg-default-100 animate-pulse rounded-xl" />
    </div>
  </div>
);

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats,      setStats]      = useState<Stats>({ total: 0, pending: 0, verified: 0 });
  const [monitoring, setMonitoring] = useState<MonitoringData>({ activeStaff: [], storageGrowth: [], leaderboard: [] });
  const [loading,    setLoading]    = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard");
      const payload  = response.data ?? {};

      setStats({
        total:    Number(payload.stats?.total   || 0),
        pending:  Number(payload.stats?.pending  || 0),
        verified: Number(payload.stats?.verified || 0),
      });
      if (payload.monitoring) {
        setMonitoring({
          activeStaff:   payload.monitoring.activeStaff   || [],
          storageGrowth: payload.monitoring.storageGrowth || [],
          leaderboard:   payload.monitoring.leaderboard   || [],
        });
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="h-full w-full flex flex-col gap-3 p-3 overflow-hidden max-w-[1600px] mx-auto">
      {/* ── Row 1: Header ── */}
      <Header />

      {loading ? <DashboardSkeleton /> : (
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {/* ── Row 2: Stats Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
            <StatsGrid stats={stats} />
          </div>

          {/* ── Row 3: Main content area ── */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3">

            {/* Col A (3/12): Leaderboard + Health */}
            <div className="lg:col-span-3 flex flex-col gap-3 min-h-0">
              <div className="flex-[2] min-h-0">
                <Leaderboard data={monitoring.leaderboard} />
              </div>
              <HealthBadge />
            </div>

            {/* Col B (5/12): Distribution chart + Growth chart */}
            <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
              <div className="flex-1 min-h-0">
                <DistributionChart stats={stats} />
              </div>
              <div className="flex-1 min-h-0">
                <GrowthChart data={monitoring.storageGrowth} />
              </div>
            </div>

            {/* Col C (4/12): Active Staff + Management Portal */}
            <div className="lg:col-span-4 flex flex-col gap-3 min-h-0">
              {/* Active Staff first now */}
              <div className="flex-1 min-h-0">
                <ActiveStaff data={monitoring.activeStaff} />
              </div>

              {/* Management Portal moved below */}
              <div className="flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="h-px flex-1 bg-divider" />
                  <h4 className="font-bold text-[9px] uppercase text-default-400 tracking-[0.2em] shrink-0 text-center px-2">
                    Management Portal
                  </h4>
                  <div className="h-px flex-1 bg-divider" />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <QuickActions />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}