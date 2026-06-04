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
  Trash2,
  CalendarDays,
} from "lucide-react";

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
  draft: number;
  rejected: number;
  thisMonth: number;
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
      { label: "Draft",       value: stats.draft,    Icon: Files,      color: "text-default-500", trend: "-",     isUp: true },
      { label: "Rejected",    value: stats.rejected, Icon: Trash2,     color: "text-danger",     trend: "-",     isUp: false },
      { label: "This Month",  value: stats.thisMonth,Icon: CalendarDays,color: "text-primary",    trend: "-",     isUp: true },
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

// ─── Table — Document Distribution ───────────────────────────────────────────
const DistributionChart: FC<{ stats: Stats }> = memo(({ stats }) => {
  const rows = useMemo(() => {
    const total = stats.total || 1;
    return [
      { label: "Pending", count: stats.pending, pct: (stats.pending / total) * 100, color: "bg-warning", dot: "bg-warning" },
      { label: "Verified", count: stats.verified, pct: (stats.verified / total) * 100, color: "bg-success", dot: "bg-success" },
      { label: "Total", count: stats.total, pct: 100, color: "bg-primary", dot: "bg-primary" },
    ];
  }, [stats]);

  return (
    <Card className="border-divider shadow-sm flex flex-col h-full">
      <Card.Content className="p-3 flex flex-col h-full">
        <div className="flex justify-between items-center mb-3 shrink-0">
          <div>
            <h4 className="font-bold text-xs">Distribution</h4>
            <p className="text-default-400 text-[9px]">Document status breakdown</p>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <div className="flex flex-col justify-center h-full gap-2.5">
            <div className="grid grid-cols-[1fr_44px_48px] gap-x-2 text-[9px] font-bold text-default-400 uppercase tracking-wider px-2 mb-0.5">
              <span>Status</span>
              <span className="text-right">Count</span>
              <span className="text-right">%</span>
            </div>
            {rows.map((r) => (
              <div key={r.label} className="group">
                <div className="grid grid-cols-[1fr_44px_48px] gap-x-2 items-center px-2 py-1.5 rounded-lg hover:bg-default-100/50 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${r.dot}`} />
                    <span className="text-xs font-semibold text-foreground truncate">{r.label}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground tabular-nums text-right">{r.count}</span>
                  <span className="text-xs font-semibold text-default-500 tabular-nums text-right">{r.pct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-default-100 mx-2 overflow-hidden">
                  <motion.div
                    animate={{ width: `${r.pct}%` }}
                    className={`h-full rounded-full ${r.color}`}
                    initial={{ width: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
});
DistributionChart.displayName = "DistributionChart";

// ─── Sparkline Table — Storage Growth ────────────────────────────────────────
function linearPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
}

function buildGradientStops(data: { count: number }[]): { offset: string; color: string }[] {
  if (data.length < 2) return [];
  const stops: { offset: string; color: string }[] = [];
  const n = data.length;
  for (let i = 0; i < n - 1; i++) {
    const start = (i / (n - 1)) * 100;
    const end = ((i + 1) / (n - 1)) * 100;
    const c = data[i + 1].count > data[i].count ? "#17c964" : data[i + 1].count < data[i].count ? "#f31260" : "#9353d3";
    stops.push({ offset: `${start}%`, color: c });
    stops.push({ offset: `${end}%`, color: c });
  }
  return stops;
}

const GrowthTable: FC<{ data: MonitoringData["storageGrowth"] }> = ({ data }) => {
  const {
    rows, total, mainPath, sparkPath, gradientStops, overallChange,
  } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        rows: [], total: 0, mainPath: "", sparkPath: "",
        gradientStops: [], overallChange: null,
      };
    }

    const counts = data.map((d) => d.count);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    const range = max - min || 1;
    const sw = 80;

    const computedRows = data.map((item, idx) => {
      const prev = idx > 0 ? data[idx - 1].count : null;
      const change = prev !== null ? ((item.count - prev) / prev) * 100 : null;
      return { ...item, change };
    });

    const ptFn = (h: number) => (d: (typeof data)[0], i: number) => ({
      x: data.length > 1 ? (i / (data.length - 1)) * sw : sw / 2,
      y: h - ((d.count - min) / range) * (h - 4) - 2,
    });

    const mainPts = data.map(ptFn(36));
    const sparkPts = data.map(ptFn(24));
    const mainPath = linearPath(mainPts);
    const sparkPath = linearPath(sparkPts);
    const gradientStops = buildGradientStops(data);

    const overall =
      data.length > 1
        ? ((data[data.length - 1].count - data[0].count) / data[0].count) * 100
        : null;

    return {
      rows: computedRows,
      total: counts.reduce((a, b) => a + b, 0),
      mainPath,
      sparkPath,
      gradientStops,
      overallChange: overall,
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card className="border-divider shadow-sm flex flex-col h-full">
        <Card.Content className="p-3 flex flex-col h-full justify-center items-center">
          <TrendingUp size={20} className="text-default-300 mb-2" />
          <p className="text-xs text-default-400">No growth data yet</p>
        </Card.Content>
      </Card>
    );
  }

  const sw = 80;
  const sh = 24;

  return (
    <Card className="border-divider shadow-sm flex flex-col h-full">
      <Card.Content className="p-3 flex flex-col h-full">
        <div className="flex justify-between items-center mb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-lg bg-secondary/10 text-secondary">
              <TrendingUp size={14} />
            </div>
            <h4 className="font-bold text-xs">Growth</h4>
          </div>
          <Chip className="h-4 text-[9px]" color="default" size="sm" variant="soft">
            7 Days
          </Chip>
        </div>

        {/* ── Mini Chart ── */}
        <div className="mb-2 shrink-0 relative">
          <svg width="100%" height="40" viewBox="0 0 80 40" className="w-full overflow-visible">
            <defs>
              <linearGradient id="growthGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#9353d3" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#9353d3" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
                {gradientStops.map((s, i) => (
                  <stop key={i} offset={s.offset} stopColor={s.color} />
                ))}
              </linearGradient>
            </defs>

            <motion.path
              d={`${mainPath} L80 40 L0 40 Z`}
              fill="url(#growthGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            />

            <motion.path
              d={mainPath}
              stroke="url(#lineGrad)"
              strokeWidth={2.5}
              fill="none"
              strokeLinejoin="miter"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>
        </div>

        {/* ── Table ── */}
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-[9px] font-bold text-default-400 uppercase tracking-wider">
                <th className="text-left py-1 pr-2 font-medium">Date</th>
                <th className="text-right py-1 px-2 font-medium">Docs</th>
                <th className="text-right py-1 px-2 font-medium">Change</th>
                <th className="text-right py-1 pl-2 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="group hover:bg-default-100/40 transition-colors">
                  <td className="py-1.5 pr-2 font-medium text-foreground whitespace-nowrap">
                    {row.date.split("-").slice(2).join("/")}
                  </td>
                  <td className="py-1.5 px-2 text-right font-bold tabular-nums text-foreground">
                    {row.count}
                  </td>
                  <td className="py-1.5 px-2 text-right">
                    {row.change !== null ? (
                      <span className={`tabular-nums font-semibold ${row.change >= 0 ? "text-success" : "text-danger"}`}>
                        {row.change >= 0 ? "+" : ""}
                        {row.change.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-default-300">&mdash;</span>
                    )}
                  </td>
                  <td className="py-1.5 pl-2 text-right">
                    <svg width={sw} height={sh} viewBox={`0 0 ${sw} ${sh}`} className="inline-block align-middle overflow-visible">
                      <defs>
                        <linearGradient id={`sg-${idx}`} x1="0" x2="1" y1="0" y2="0">
                          {gradientStops.map((s, i) => (
                            <stop key={i} offset={s.offset} stopColor={s.color} />
                          ))}
                        </linearGradient>
                      </defs>
                      <path d={sparkPath} stroke={`url(#sg-${idx})`} strokeWidth={1.5} fill="none" className="opacity-40" />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-divider">
                <td className="pt-2 pr-2 font-bold text-foreground text-[10px]">Total</td>
                <td className="pt-2 px-2 text-right font-bold tabular-nums text-foreground">{total}</td>
                <td className="pt-2 px-2 text-right">
                  {overallChange !== null ? (
                    <span className={`tabular-nums font-semibold text-[10px] ${overallChange >= 0 ? "text-success" : "text-danger"}`}>
                      {overallChange >= 0 ? "+" : ""}
                      {overallChange.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-default-300">&mdash;</span>
                  )}
                </td>
                <td className="pt-2 pl-2 text-right">
                  <svg width={sw} height={sh} viewBox={`0 0 ${sw} ${sh}`} className="inline-block align-middle">
                    <defs>
                      <linearGradient id="sf" x1="0" x2="1" y1="0" y2="0">
                        {gradientStops.map((s, i) => (
                          <stop key={i} offset={s.offset} stopColor={s.color} />
                        ))}
                      </linearGradient>
                    </defs>
                    <motion.path
                      d={sparkPath}
                      stroke="url(#sf)"
                      strokeWidth={2}
                      fill="none"
                      strokeLinejoin="miter"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2, ease: "linear" }}
                    />
                  </svg>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card.Content>
    </Card>
  );
};

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
      {Array.from({ length: 7 }).map((_, i) => (
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
  const [stats,      setStats]      = useState<Stats>({ total: 0, pending: 0, verified: 0, draft: 0, rejected: 0, thisMonth: 0 });
  const [monitoring, setMonitoring] = useState<MonitoringData>({ activeStaff: [], storageGrowth: [], leaderboard: [] });
  const [loading,    setLoading]    = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard");
      const payload  = response.data ?? {};

      setStats({
        total:     Number(payload.stats?.total     || 0),
        pending:   Number(payload.stats?.pending   || 0),
        verified:  Number(payload.stats?.verified  || 0),
        draft:     Number(payload.stats?.draft     || 0),
        rejected:  Number(payload.stats?.rejected  || 0),
        thisMonth: Number(payload.stats?.thisMonth || 0),
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
            <StatsGrid stats={stats as Stats} />
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
                <GrowthTable data={monitoring.storageGrowth} />
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