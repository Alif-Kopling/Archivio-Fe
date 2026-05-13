import { FC } from "react";
import { Card } from "@heroui/react";
import { HardDrive } from "lucide-react";
import { StorageIndicator } from "./StorageIndicator";

interface StorageOverviewProps {
  totalDocs: number;
}

export const StorageOverview: FC<StorageOverviewProps> = ({ totalDocs }) => (
  <Card className="bg-content1 border-divider shadow-sm rounded-3xl h-full">
    <Card.Content className="p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <HardDrive className="text-primary" size={20} />
          <h4 className="font-bold text-lg">System Storage</h4>
        </div>
        <div className="p-6 rounded-3xl bg-default-50 border border-divider mb-6">
          <StorageIndicator count={totalDocs} label="Global Storage" total={5000} showGb />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-default-500 font-medium">
          Your storage is approximately <span className="text-foreground font-bold">{((totalDocs * 10 / 1024) / 10 * 100).toFixed(1)}%</span> full.
        </p>
        <p className="text-[10px] text-default-400">
          Estimated based on {totalDocs} total documents in the database.
        </p>
      </div>
    </Card.Content>
  </Card>
);
