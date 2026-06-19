import { FC, memo, useEffect, useMemo, useState, useCallback } from "react";
import { Card, Chip, Button } from "@heroui/react";
import {
  Files,
  Hourglass,
  ShieldCheck,
  ClipboardCheck,
  Upload,
  Bell,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import api from "@/lib/axios";
import { ThemeSwitch } from "@/components/common/theme-switch";

interface Stats {
  total: number;
  pending: number;
  verified: number;
}

interface DocumentItem {
  id: number;
  title: string;
  status: string;
  type: string;
  sender: string;
  createdAt: string;
}

interface StatItem {
  label: string;
  value: number | string;
  Icon: typeof Files;
  color: string;
}

const Header: FC = () => (
  <header className="flex flex-row justify-between items-center shrink-0 h-10">
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
        <Activity size={16} />
      </div>
      <h1 className="text-base font-bold tracking-tight">Dashboard</h1>
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

const StatsGrid: FC<{ stats: Stats }> = memo(({ stats }) => {
  const items = useMemo<StatItem[]>(
    () => [
      {
        label: "Total Docs",
        value: stats.total,
        Icon: Files,
        color: "text-primary",
      },
      {
        label: "Pending",
        value: stats.pending,
        Icon: Hourglass,
        color: "text-warning",
      },
      {
        label: "Verified",
        value: stats.verified,
        Icon: ShieldCheck,
        color: "text-success",
      },
    ],
    [stats],
  );

  return (
    <>
      {items.map(({ label, value, Icon, color }) => (
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
              </div>
            </div>
          </Card.Content>
        </Card>
      ))}
    </>
  );
});

StatsGrid.displayName = "StatsGrid";

const statusColorMap: Record<
  string,
  "warning" | "success" | "danger" | "accent" | "default"
> = {
  pending: "warning",
  draft: "default",
  verified: "success",
  final: "accent",
  rejected: "danger",
};

const PendingList: FC<{ data: DocumentItem[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="border-divider shadow-sm h-full">
        <Card.Content className="flex flex-col items-center justify-center h-full gap-2">
          <ClipboardCheck className="text-default-300" size={24} />
          <p className="text-sm text-default-400">No pending documents</p>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card className="border-divider shadow-sm h-full flex flex-col">
      <Card.Content className="p-3 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h4 className="font-bold text-xs">Pending Approvals</h4>
          <Link
            className="text-[10px] font-semibold text-primary hover:underline"
            to="/approvals"
          >
            View All
          </Link>
        </div>
        <div className="flex-1 min-h-0 flex flex-col gap-1">
          {data.slice(0, 5).map((doc) => (
            <Link
              key={doc.id}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-default-100/50 transition-colors shrink-0"
              to="/approvals"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {doc.title}
                </p>
                <p className="text-[10px] text-default-400 truncate">
                  {doc.sender} &middot; {doc.type}
                </p>
              </div>
              <Chip
                className="h-4 text-[9px] font-bold px-1 ml-2 shrink-0"
                color={statusColorMap[doc.status] || "default"}
                size="sm"
                variant="soft"
              >
                {doc.status}
              </Chip>
            </Link>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
};

const DistributionCard: FC<{ stats: Stats }> = memo(({ stats }) => {
  const rows = useMemo(() => {
    const total = stats.total || 1;

    return [
      {
        label: "Pending",
        count: stats.pending,
        pct: (stats.pending / total) * 100,
        color: "bg-warning",
        dot: "bg-warning",
      },
      {
        label: "Verified",
        count: stats.verified,
        pct: (stats.verified / total) * 100,
        color: "bg-success",
        dot: "bg-success",
      },
      {
        label: "Total",
        count: stats.total,
        pct: 100,
        color: "bg-primary",
        dot: "bg-primary",
      },
    ];
  }, [stats]);

  return (
    <Card className="border-divider shadow-sm flex-1 flex flex-col">
      <Card.Content className="p-3 flex flex-col h-full">
        <h4 className="font-bold text-xs mb-3 shrink-0">Distribution</h4>
        <div className="flex-1 flex flex-col justify-center gap-2.5">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between px-1 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${r.dot}`} />
                  <span className="text-[10px] font-semibold text-foreground">
                    {r.label}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-default-500 tabular-nums">
                  {r.count} ({r.pct.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-default-100 overflow-hidden">
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
      </Card.Content>
    </Card>
  );
});

DistributionCard.displayName = "DistributionCard";

const QuickActionCard: FC<{
  label: string;
  icon: typeof Upload;
  href: string;
  color: string;
  bg: string;
}> = ({ label, icon: Icon, href, color, bg }) => (
  <Link to={href}>
    <Card className="border-divider shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 relative overflow-hidden aspect-square">
      <div
        className={`absolute inset-0 opacity-[0.03] ${bg} group-hover:opacity-[0.08] transition-opacity`}
      />
      <Card.Content className="p-3 flex flex-col items-center justify-center gap-2 relative z-10 h-full">
        <div
          className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-all duration-300 shadow-sm shrink-0`}
        >
          <Icon size={28} />
        </div>
        <span className="text-[10px] font-bold text-default-600 group-hover:text-foreground transition-colors uppercase tracking-tight truncate text-center">
          {label}
        </span>
      </Card.Content>
    </Card>
  </Link>
);

const DashboardSkeleton: FC = () => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="h-[100px] bg-default-100 animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
      <div className="lg:col-span-7 h-full min-h-[250px] bg-default-100 animate-pulse rounded-xl" />
      <div className="lg:col-span-5 h-full min-h-[250px] bg-default-100 animate-pulse rounded-xl" />
    </div>
  </div>
);

export default function StaffDashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    verified: 0,
  });
  const [pending, setPending] = useState<DocumentItem[]>([]);
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
      setPending(payload.data || []);
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
      <Header />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 shrink-0">
            <StatsGrid stats={stats} />
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-7 min-h-0">
              <PendingList data={pending} />
            </div>
            <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
              <DistributionCard stats={stats} />
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <QuickActionCard
                  bg="bg-primary/10"
                  color="text-primary"
                  href="/archives"
                  icon={Upload}
                  label="Upload"
                />
                <QuickActionCard
                  bg="bg-warning/10"
                  color="text-warning"
                  href="/approvals"
                  icon={ClipboardCheck}
                  label="Approvals"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
