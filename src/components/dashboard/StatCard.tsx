import { Card } from "@heroui/react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  count: number;
  Icon: LucideIcon;
  color: string;
  bg: string;
}

export const StatCard = ({ label, count, Icon, color, bg }: StatCardProps) => (
  <Card className="p-4 flex flex-row items-center gap-4">
    <div className={`p-3 rounded-lg ${bg} ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <h3 className="text-xl font-bold">{count}</h3>
    </div>
  </Card>
);
