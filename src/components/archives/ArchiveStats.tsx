import { StatCard } from "@/components/dashboard/StatCard";
import { LucideIcon } from "lucide-react";
import { FC } from "react";

export interface StatConfigItem {
  key: string;
  label: string;
  Icon: LucideIcon;
  color: string;
  bg: string;
}

interface ArchiveStatsProps {
  stats: Record<string, number>;
  configs: readonly StatConfigItem[];
}

export const ArchiveStats: FC<ArchiveStatsProps> = ({ stats, configs }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {configs.map(({ key, label, Icon, color, bg }) => (
        <StatCard
          key={key}
          Icon={Icon}
          bg={bg}
          color={color}
          count={stats[key] || 0}
          label={label}
        />
      ))}
    </div>
  );
};
