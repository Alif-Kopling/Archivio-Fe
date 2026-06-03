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
    <div className="flex items-center justify-between mb-8 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-primary/20 text-primary backdrop-blur-sm shadow-inner">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-default-500 text-sm">
            Manage Archivio configurations
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {hasChanges && (
          <Chip color="warning" size="sm" variant="flat" className="backdrop-blur-sm">
            Unsaved changes
          </Chip>
        )}
        <Button 
          variant="flat" 
          onClick={onReset}
          className="backdrop-blur-sm bg-default-100/50 hover:bg-default-200/50"
        >
          <RefreshCw className="mr-2" size={16} />
          Reset
        </Button>
        <Button
          className="bg-primary text-white font-bold px-6 shadow-lg shadow-primary/20"
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
