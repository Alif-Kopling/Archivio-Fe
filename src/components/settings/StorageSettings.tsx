import { Button, Input, Label, TextField } from "@heroui/react";
import { FC } from "react";

interface StorageSettingsProps {
  settings: {
    max_file_size: string;
    allowed_file_types: string;
  };
  loading: boolean;
  savingCategory: string;
  onChange: (key: string, value: any) => void;
  onSave: () => void;
}

export const StorageSettings: FC<StorageSettingsProps> = ({
  settings,
  loading,
  savingCategory,
  onChange,
  onSave,
}) => {
  return (
    <div className="p-8 rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Storage Settings</h2>
        <p className="text-sm text-default-500">
          Configure file storage limitations and file type policies.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TextField name="max_file_size" type="number">
          <Label className="block text-xs font-bold uppercase tracking-wider mb-2 text-default-600 ml-1">
            m Max File Size (MB)
          </Label>
          <Input
            className="h-12 bg-white/5 border-white/10"
            placeholder="10"
            value={settings.max_file_size}
            onChange={(e) => onChange("max_file_size", e.target.value)}
          />
          <p className="text-xs text-default-500 mt-2 ml-1">
            Maximum file size that can be uploaded
          </p>
        </TextField>

        <TextField name="allowed_file_types">
          <Label className="block text-xs font-bold uppercase tracking-wider mb-2 text-default-600 ml-1">
            Allowed File Types
          </Label>
          <Input
            className="h-12 bg-white/5 border-white/10"
            placeholder="pdf,doc,docx,jpg,png"
            value={settings.allowed_file_types}
            onChange={(e) => onChange("allowed_file_types", e.target.value)}
          />
          <p className="text-xs text-default-500 mt-2 ml-1">
            Separate with commas (e.g.: pdf,doc,docx)
          </p>
        </TextField>
      </div>

      <div className="flex justify-end pt-4 border-t border-white/10">
        <Button
          className="bg-primary text-white font-bold px-8 h-12 shadow-lg shadow-primary/20"
          isDisabled={loading && savingCategory === "storage"}
          onClick={onSave}
        >
          {savingCategory === "storage" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
