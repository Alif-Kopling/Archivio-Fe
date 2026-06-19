import { FC, useEffect, useState, useCallback } from "react";
import { Card } from "@heroui/react";
import { Users, Trophy, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";

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

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
} as const;

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
  <motion.div className="h-full" variants={fadeUp}>
    <Card className="border-divider shadow-sm h-full flex flex-col overflow-hidden">
      <Card.Content className="p-3 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <div className="p-1 rounded-lg bg-primary/10 text-primary">
            <Users size={14} />
          </div>
          <h4 className="font-bold text-xs">Active Staff</h4>
        </div>
        <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
          {data.slice(0, 4).map((item, idx) => (
            <motion.div
              key={idx}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between group"
              initial={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.3, delay: 0.15 + idx * 0.08 }}
            >
              <div className="flex items-center gap-2">
                <div className="relative shrink-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-400 flex items-center justify-center font-bold text-[10px] text-white shadow-sm group-hover:shadow-md transition-shadow">
                    {item.user?.name?.charAt(0)}
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-background animate-breathing" />
                </div>
                <div>
                  <p className="text-xs font-medium truncate max-w-[100px] group-hover:text-foreground transition-colors">
                    {item.user?.name}
                  </p>
                  <p className="text-[9px] text-default-400 truncate max-w-[100px]">
                    {item.user?.role}
                  </p>
                </div>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-breathing shrink-0" />
            </motion.div>
          ))}
        </div>
      </Card.Content>
    </Card>
  </motion.div>
);

const Leaderboard: FC<{ data: MonitoringData["leaderboard"] }> = ({ data }) => (
  <motion.div className="h-full" variants={fadeUp}>
    <Card className="border-divider shadow-sm h-full flex flex-col overflow-hidden">
      <Card.Content className="p-3 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <div className="p-1 rounded-lg bg-warning/10 text-warning">
            <Trophy size={14} />
          </div>
          <h4 className="font-bold text-xs">Top Contributors</h4>
        </div>
        <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
          {data.slice(0, 4).map((item, idx) => (
            <motion.div
              key={idx}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between group"
              initial={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.3, delay: 0.15 + idx * 0.08 }}
            >
              <div className="flex items-center gap-2">
                <motion.span
                  className={`text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center ${
                    idx === 0
                      ? "text-warning bg-warning/10"
                      : idx === 1
                        ? "text-default-400 bg-default-100"
                        : idx === 2
                          ? "text-orange-400 bg-orange-100 dark:bg-orange-900/20"
                          : "text-default-300 bg-default-50"
                  }`}
                  whileHover={{ scale: 1.2 }}
                >
                  {idx === 0 ? <Trophy size={10} /> : `#${idx + 1}`}
                </motion.span>
                <p className="text-xs font-medium truncate max-w-[100px]">
                  {item.user?.name}
                </p>
              </div>
              <span className="text-[9px] font-bold text-foreground tabular-nums group-hover:scale-110 transition-transform">
                {item.count}
              </span>
            </motion.div>
          ))}
        </div>
      </Card.Content>
    </Card>
  </motion.div>
);

const HealthBadge: FC = () => (
  <motion.div variants={fadeUp}>
    <Card className="border-none bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shrink-0 overflow-hidden relative">
      <Card.Content className="p-3 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Shield size={16} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-primary uppercase tracking-widest">
              System Health
            </p>
            <h5 className="font-bold text-sm flex items-center gap-2">
              Operational
              <span className="inline-flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-breathing" />
                <span className="text-[9px] font-medium text-success">
                  Live
                </span>
              </span>
            </h5>
          </div>
        </div>
        <div className="flex items-center gap-2 text-default-400">
          <Clock size={11} />
          <span className="text-[9px] font-medium tabular-nums">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </Card.Content>
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-primary/5 blur-xl animate-float" />
      <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-primary/5 blur-xl animate-float-delayed" />
    </Card>
  </motion.div>
);

const DashboardSkeleton: FC = () => (
  <motion.div
    className="flex flex-col gap-4"
    exit={{ opacity: 0, transition: { duration: 0.3 } }}
    initial={{ opacity: 1 }}
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 12 }}
          transition={{ delay: i * 0.06 }}
        >
          <Card className="h-[100px] relative overflow-hidden">
            <div className="absolute inset-0 bg-default-100" />
            <div className="absolute inset-0 shimmer-overlay" />
          </Card>
        </motion.div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-3 h-[400px]">
        <Card className="h-full relative overflow-hidden">
          <div className="absolute inset-0 bg-default-100" />
          <div className="absolute inset-0 shimmer-overlay" />
        </Card>
      </div>
      <div className="lg:col-span-6 h-[400px]">
        <Card className="h-full relative overflow-hidden">
          <div className="absolute inset-0 bg-default-100" />
          <div className="absolute inset-0 shimmer-overlay" />
        </Card>
      </div>
      <div className="lg:col-span-3 h-[400px]">
        <Card className="h-full relative overflow-hidden">
          <div className="absolute inset-0 bg-default-100" />
          <div className="absolute inset-0 shimmer-overlay" />
        </Card>
      </div>
    </div>
  </motion.div>
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
    <div className="h-full w-full flex flex-col gap-3 p-3 overflow-hidden max-w-[1600px] mx-auto relative">
      <div className="absolute inset-0 pointer-events-none ambient-gradient" />
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/3 blur-3xl animate-float" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-warning/3 blur-3xl animate-float-delayed" />

      <div className="relative z-10 flex flex-col gap-3 flex-1 min-h-0">
        <DashboardHeader
          hasData={trends.length > 0}
          onExport={() => exportCSV(trends, stats)}
        />

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <motion.div
            animate="show"
            className="flex-1 flex flex-col gap-3 min-h-0"
            initial="hidden"
            variants={container}
          >
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0"
              variants={fadeUp}
            >
              <StatsGrid stats={stats} />
            </motion.div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-3 flex flex-col gap-3 min-h-0">
                <motion.div className="flex-[2] min-h-0" variants={fadeUp}>
                  <DistributionChart stats={stats} />
                </motion.div>
                <HealthBadge />
              </div>

              <motion.div className="lg:col-span-6 min-h-0" variants={fadeUp}>
                <TrendsChart data={trends} />
              </motion.div>

              <div className="lg:col-span-3 flex flex-col gap-3 min-h-0">
                <ActiveStaff data={monitoring.activeStaff} />
                <Leaderboard data={monitoring.leaderboard} />
              </div>
            </div>

            <motion.div
              className="flex flex-col gap-2 shrink-0"
              variants={fadeUp}
            >
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
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
