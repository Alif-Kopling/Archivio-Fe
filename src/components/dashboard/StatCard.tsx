import { Card } from "@heroui/react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  count: number;
  Icon: LucideIcon;
  color: string;
}

export const StatCard = ({ label, count, Icon, color }: StatCardProps) => {
  // Helper untuk mendapatkan class bg yang sesuai
  const getBgClass = (textClass: string) => {
    if (textClass.includes('amber')) return 'bg-amber-500';
    return textClass.replace("text-", "bg-");
  };

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      <div
        className={`absolute inset-0 opacity-[0.1] ${getBgClass(color)} group-hover:opacity-[0.15] transition-opacity`}
      />
      <Card.Content className="px-5 py-4 flex items-center gap-4 relative z-10">
        <div
          className={`p-3 rounded-xl ${getBgClass(color)}/10 ${color} shrink-0`}
        >
          <Icon size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-default-500 uppercase tracking-wider">
            {label}
          </p>
          <motion.h3
            key={count}
            animate={{ scale: [1, 1.1, 1] }}
            className="text-2xl font-extrabold text-foreground tabular-nums mt-0.5"
            transition={{ duration: 0.3 }}
          >
            {count}
          </motion.h3>
        </div>
      </Card.Content>
    </Card>
  );
};
