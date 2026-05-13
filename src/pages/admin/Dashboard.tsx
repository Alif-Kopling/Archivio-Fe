/* eslint-disable prettier/prettier */
 
/* eslint-disable no-console */
import { FC, memo, useEffect, useMemo, useState, useCallback } from "react";
import {
  Card,
  Button,
  Chip,
  Spinner,
} from "@heroui/react";
import {
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
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

import api from "@/lib/axios";
import { ThemeSwitch } from "@/components/common/theme-switch";
import { QuickActions } from "@/components/dashboard/QuickActions";

// --- Types ---
interface Stats {
  total: number;
  pending: number;
  verified: number;
}

// --- Sub-components ---

const Header: FC = () => (
  <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-primary/10 text-primary">
        <LayoutDashboard size={24} />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-default-500 text-sm">
          Welcome back! Monitor and manage your archive statistics.
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Button
        isIconOnly
        className="bg-default-100 text-default-500 rounded-full"
        variant="ghost"
      >
        <Bell size={18} />
      </Button>
      <ThemeSwitch />
    </div>
  </header>
);

const StatsGrid: FC<{ stats: Stats }> = memo(({ stats }) => {
  const data = useMemo(
    () => [
      {
        title: "Total Documents",
        value: stats.total.toString(),
        trend: "+5.2%",
        isUp: true,
      },
      {
        title: "Pending Approval",
        value: stats.pending.toString(),
        trend: "+2.1%",
        isUp: true,
      },
      {
        title: "Verified Archives",
        value: stats.verified.toString(),
        trend: "+12.5%",
        isUp: true,
      },
      { title: "System Active", value: "Online", trend: "Stable", isUp: true },
    ],
    [stats.pending, stats.total, stats.verified],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {data.map((stat, idx) => (
        <Card key={idx} className="bg-content1 border-divider">
          <Card.Content className="p-4">
            <p className="text-default-500 text-xs mb-1">{stat.title}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <div
                className={`flex items-center text-xs ${stat.isUp ? "text-success" : "text-danger"} bg-default-100 px-2 py-0.5 rounded-full`}
              >
                {stat.isUp ? (
                  <ArrowUpRight className="mr-1" size={12} />
                ) : (
                  <ArrowDownRight className="mr-1" size={12} />
                )}
                {stat.trend}
              </div>
            </div>
          </Card.Content>
        </Card>
      ))}
    </div>
  );
});

StatsGrid.displayName = "StatsGrid";

const ChartsSection: FC<{ stats: Stats }> = memo(({ stats }) => {
  const barData = useMemo(
    () => [
      { name: "Pending", count: stats.pending, fill: "#f5a524" },
      { name: "Verified", count: stats.verified, fill: "#17c964" },
      { name: "Total", count: stats.total, fill: "#006fee" },
    ],
    [stats.pending, stats.total, stats.verified],
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Bar Chart */}
      <Card className="bg-content1 border-divider shadow-sm rounded-3xl">
        <Card.Content className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-bold text-lg">Archive Statistics</h4>
              <p className="text-default-500 text-sm">
                Status document distribution
              </p>
            </div>
            <Chip color="default" variant="soft">
              Overview
            </Chip>
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
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  cursor={{ fill: "transparent" }}
                />
                <Bar barSize={50} dataKey="count" radius={[12, 12, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card.Content>
      </Card>

      {/* Line Chart */}
      <Card className="bg-content1 border-divider shadow-sm rounded-3xl">
        <Card.Content className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-bold text-lg">System Traffic</h4>
              <p className="text-default-500 text-sm">Weekly system activity</p>
            </div>
            <Chip color="default" variant="soft">
              Live
            </Chip>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart
                data={lineData}
              >
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
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  dataKey="v"
                  dot={{ r: 6, fill: "#7828c8" }}
                  stroke="#7828c8"
                  strokeWidth={4}
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
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
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
