import { Button } from "@heroui/react";
import { AlertTriangle, Trash2 } from "lucide-react";
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
    <div className="p-8 rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Trash & Maintenance</h2>
          <p className="text-sm text-default-500">
            Manage permanently deleted or rejected documents.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-danger/20 bg-danger/5 p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle size={20} />
              <p className="text-xs font-bold uppercase tracking-wider">
                Rejected documents
              </p>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              Trash bin for rejected files
            </h3>
            <p className="text-sm text-default-600 max-w-lg leading-relaxed">
              Rejected documents are kept here until you permanently remove them. Deleting them will also remove the stored file from disk.
            </p>
          </div>

          <div className="min-w-[180px] rounded-2xl bg-white/10 backdrop-blur-sm p-6 text-center border border-white/10 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-default-500">
              In Trash
            </p>
            <p className="mt-2 text-5xl font-black text-danger">
              {trashRejectedCount}
            </p>
            <p className="text-xs font-medium text-default-500 mt-1">rejected files</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-danger/10 flex flex-col sm:flex-row sm:items-center gap-4">
          <Button
            className="bg-danger text-white font-bold px-8 h-12 shadow-lg shadow-danger/20"
            isDisabled={trashRejectedCount === 0}
            onClick={onEmptyTrash}
          >
            <Trash2 className="mr-2" size={18} />
            Empty Trash
          </Button>
          <p className="text-xs text-default-500 font-medium">
            This action is permanent and cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );
};
