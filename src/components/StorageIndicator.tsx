import { FC } from "react";
import { Label, ProgressBar } from "@heroui/react";

interface StorageIndicatorProps {
  label: string;
  count: number;
  total: number;
}

export const StorageIndicator: FC<StorageIndicatorProps> = ({ 
  label, 
  count, 
  total, 
}) => {
  const percentage = (count / total) * 100;

  return (
    <div className="w-full py-4">
      <ProgressBar 
        aria-label={label} 
        className="w-full" 
        value={percentage}
      >
        <div className="flex justify-between text-sm mb-2">
          <Label className="font-medium text-default-600">{label}</Label>
          <ProgressBar.Output className="text-default-500 text-sm">
            {count} / {total} Dokumen
          </ProgressBar.Output>
        </div>
        <ProgressBar.Track className="h-2 w-full bg-default-200 rounded-full">
          <ProgressBar.Fill className={`h-full rounded-full ${percentage > 80 ? "bg-danger" : "bg-primary"}`} />
        </ProgressBar.Track>
      </ProgressBar>
    </div>
  );
};
