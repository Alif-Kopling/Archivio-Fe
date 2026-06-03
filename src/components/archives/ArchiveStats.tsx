import { LucideIcon } from "lucide-react";
import { FC } from "react";

import { StatCard } from "@/components/dashboard/StatCard";

export interface StatConfigItem {
  key: string;
  label: string;
  Icon: LucideIcon;
  color: string;
}

interface ArchiveStatsProps {
  stats: Record<string, number>;
  configs: readonly StatConfigItem[];
}

export const ArchiveStats: FC<ArchiveStatsProps> = ({ stats, configs }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {configs.map(({ key, label, Icon, color }) => (
        <StatCard
          key={key}
          Icon={Icon}
          color={color}
          count={stats[key] || 0}
          label={label}
        />
      ))}
    </div>
  );
};
