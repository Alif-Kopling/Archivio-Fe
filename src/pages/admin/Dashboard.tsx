import { FC, useEffect, useState, useCallback } from "react";
import { Card } from "@heroui/react";
import { Users, Trophy } from "lucide-react";

import api from "@/lib/axios";
import { QuickActions } from "@/components/dashboard/QuickActions";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsGrid, { DashboardStats } from "@/components/dashboard/StatsGrid";
import DistributionChart from "@/components/dashboard/DistributionChart";
import TrendsChart, { TrendItem } from "@/components/dashboard/TrendsChart";

interface MonitoringData {
  activeStaff: Array<{
    userId: number;
    createdAt: string;
    user: { name: string; role: string };
  }>;
  storageGrowth: Array<{ date: string; count: number }>;
  leaderboard: Array<{ count: number; user: { name: string } }>;
}

const exportCSV = (trends: TrendItem[], stats: DashboardStats) => {
  const header = `Archivio E-Archive Report,${new Date().toLocaleDateString()}
Total Documents,${stats.total}
Pending,${stats.pending}
Verified,${stats.verified}
This Month,${stats.thisMonth}

Month,Surat Masuk,Surat Keluar,Sertifikat,Total`;

  const rows = trends.map(
    (t) => `${t.month},${t.masuk},${t.keluar},${t.sertifikat},${t.total}`,
  );
  const csv = `${header}\n${rows.join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `archivio-report-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

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
                <p className="text-xs font-medium truncate max-w-[100px]">
                  {item.user?.name}
                </p>
                <p className="text-[9px] text-default-400 truncate max-w-[100px]">
                  {item.user?.role}
                </p>
              </div>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
          </div>
        ))}
      </div>
    </Card.Content>
  </Card>
);

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
              <span
                className={`text-[9px] font-extrabold w-4 ${idx === 0 ? "text-warning" : idx === 1 ? "text-default-400" : idx === 2 ? "text-orange-400" : "text-default-300"}`}
              >
                #{idx + 1}
              </span>
              <p className="text-xs font-medium truncate max-w-[100px]">
                {item.user?.name}
              </p>
            </div>
            <span className="text-[9px] font-bold text-foreground tabular-nums">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </Card.Content>
  </Card>
);

const HealthBadge: FC = () => (
  <Card className="border-none bg-primary/5 shrink-0">
    <Card.Content className="p-3 flex items-center justify-between">
      <div>
        <p className="text-[9px] font-bold text-primary uppercase tracking-widest">
          System Health
        </p>
        <h5 className="font-bold text-sm">Operational</h5>
      </div>
      <div className="flex gap-1 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-success opacity-40" />
      </div>
    </Card.Content>
  </Card>
);

const DashboardSkeleton: FC = () => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="h-[100px] bg-default-100 animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-3 h-[400px] bg-default-100 animate-pulse rounded-xl" />
      <div className="lg:col-span-6 h-[400px] bg-default-100 animate-pulse rounded-xl" />
      <div className="lg:col-span-3 h-[400px] bg-default-100 animate-pulse rounded-xl" />
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    verified: 0,
    thisMonth: 0,
  });
  const [monitoring, setMonitoring] = useState<MonitoringData>({
    activeStaff: [],
    storageGrowth: [],
    leaderboard: [],
  });
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, trendsRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/dashboard/trends"),
      ]);

      const payload = overviewRes.data ?? {};

      setStats({
        total: Number(payload.stats?.total || 0),
        pending: Number(payload.stats?.pending || 0),
        verified: Number(payload.stats?.verified || 0),
        thisMonth: Number(payload.stats?.thisMonth || 0),
        thisMonthTrend: payload.stats?.thisMonthTrend,
      });
      if (payload.monitoring) {
        setMonitoring({
          activeStaff: payload.monitoring.activeStaff || [],
          storageGrowth: payload.monitoring.storageGrowth || [],
          leaderboard: payload.monitoring.leaderboard || [],
        });
      }
      setTrends(Array.isArray(trendsRes.data) ? trendsRes.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="h-full w-full flex flex-col gap-3 p-3 overflow-hidden max-w-[1600px] mx-auto">
      <DashboardHeader
        hasData={trends.length > 0}
        onExport={() => exportCSV(trends, stats)}
      />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
            <StatsGrid stats={stats} />
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-3 flex flex-col gap-3 min-h-0">
              <div className="flex-[2] min-h-0">
                <DistributionChart stats={stats} />
              </div>
              <HealthBadge />
            </div>

            <div className="lg:col-span-6 min-h-0">
              <TrendsChart data={trends} />
            </div>

            <div className="lg:col-span-3 flex flex-col gap-3 min-h-0">
              <div className="flex-1 min-h-0">
                <ActiveStaff data={monitoring.activeStaff} />
              </div>
              <div className="flex-1 min-h-0">
                <Leaderboard data={monitoring.leaderboard} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-px flex-1 bg-divider" />
              <h4 className="font-bold text-[9px] uppercase text-default-400 tracking-[0.2em] shrink-0 text-center px-2">
                Management Portal
              </h4>
              <div className="h-px flex-1 bg-divider" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <QuickActions />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
