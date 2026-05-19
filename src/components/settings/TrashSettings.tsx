import { Button } from "@heroui/react";
import { AlertTriangle } from "lucide-react";
import { FC } from "react";

interface TrashSettingsProps {
  trashRejectedCount: number;
  onEmptyTrash: () => void;
}

export const TrashSettings: FC<TrashSettingsProps> = ({
  trashRejectedCount,
  onEmptyTrash,
}) => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-danger/20 bg-danger/5 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle size={18} />
              <p className="text-sm font-semibold uppercase tracking-wide">
                Rejected documents
              </p>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Trash bin for rejected files
            </h3>
            <p className="text-sm text-foreground/80 max-w-2xl">
              Rejected documents are kept here until you permanently remove
              them. Deleting them will also remove the stored file from disk.
            </p>
          </div>

          <div className="min-w-[160px] rounded-2xl border border-divider bg-content1 p-4 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-default-500">
              In Trash
            </p>
            <p className="mt-2 text-4xl font-bold text-danger">
              {trashRejectedCount}
            </p>
            <p className="text-xs text-default-500">rejected files</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            className="bg-danger text-white font-medium px-6"
            isDisabled={trashRejectedCount === 0}
            onClick={onEmptyTrash}
          >
            Empty Trash
          </Button>
          <p className="text-xs text-default-500">
            This action is permanent and cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );
};
