import { Button, Chip } from "@heroui/react";
import { RefreshCw, Save, Settings as SettingsIcon } from "lucide-react";
import { FC } from "react";

interface SettingsHeaderProps {
  hasChanges: boolean;
  loading: boolean;
  onReset: () => void;
  onSaveAll: () => void;
}

export const SettingsHeader: FC<SettingsHeaderProps> = ({
  hasChanges,
  loading,
  onReset,
  onSaveAll,
}) => {
  return (
    <div className="flex items-center justify-between mb-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Manage Archivio configurations
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {hasChanges && (
          <Chip color="warning" size="sm" variant="soft">
            Unsaved changes
          </Chip>
        )}
        <Button isDisabled={loading} variant="ghost" onClick={onReset}>
          <RefreshCw className="mr-2" size={16} />
          Reset
        </Button>
        <Button
          className="bg-primary text-white font-medium px-6"
          isDisabled={!hasChanges || loading}
          onClick={onSaveAll}
        >
          {loading ? (
            <RefreshCw className="animate-spin mr-2" size={16} />
          ) : (
            <Save className="mr-2" size={16} />
          )}
          {loading ? "Saving..." : "Save All"}
        </Button>
      </div>
    </div>
  );
};
