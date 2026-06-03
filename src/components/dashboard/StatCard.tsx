import { Card } from "@heroui/react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  count: number;
  Icon: LucideIcon;
  color: string;
}

export const StatCard = ({ label, count, Icon, color }: StatCardProps) => (
  <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
    <div
      className={`absolute inset-0 opacity-[0.07] ${color.replace("text-", "bg-")} group-hover:opacity-[0.12] transition-opacity`}
    />
    <Card.Content className="px-5 py-4 flex items-center gap-4 relative z-10">
      <div
        className={`p-3 rounded-xl ${color.replace("text-", "bg-")}/10 ${color} shrink-0`}
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
