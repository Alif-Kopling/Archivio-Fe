import { FC } from "react";
import { Label, ProgressBar } from "@heroui/react";

interface StorageIndicatorProps {
  label: string;
  count: number;
  total: number;
  showGb?: boolean;
}

export const StorageIndicator: FC<StorageIndicatorProps> = ({
  label,
  count,
  total,
  showGb = false,
}) => {
  const maxGb = 10;
  const estimatedGb = (count * 10) / 1024;
  const percentage = Math.min((estimatedGb / maxGb) * 100, 100);

  return (
    <div className="w-full">
      <ProgressBar aria-label={label} className="w-full" value={percentage}>
        <div className="flex justify-between items-end mb-2">
          <Label className="text-[10px] font-bold text-default-500 uppercase tracking-wider">
            Storage
          </Label>
          <ProgressBar.Output className="text-[11px] font-semibold text-foreground tabular-nums">
            {showGb
              ? `${estimatedGb.toFixed(2)}GB/${maxGb}GB`
              : `${count}/${total}`}
          </ProgressBar.Output>
        </div>
        <ProgressBar.Track className="h-2.5 w-full bg-default-100 rounded-full shadow-inner overflow-hidden">
          <ProgressBar.Fill
            className={`h-full rounded-full transition-all duration-500 ${percentage > 80 ? "bg-danger" : "bg-primary"}`}
          />
        </ProgressBar.Track>
      </ProgressBar>
    </div>
  );
};
