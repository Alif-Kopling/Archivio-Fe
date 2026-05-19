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
    <div className="space-y-6">
      <div>
        <TextField name="max_file_size" type="number">
          <Label className="block text-sm font-semibold mb-2 text-foreground">
            Max File Size (MB)
          </Label>
          <Input
            className="w-full h-12"
            placeholder="10"
            value={settings.max_file_size}
            onChange={(e) => onChange("max_file_size", e.target.value)}
          />
        </TextField>
        <p className="text-xs text-foreground mt-1.5">
          Maximum file size that can be uploaded
        </p>
      </div>
      <div>
        <TextField name="allowed_file_types">
          <Label className="block text-sm font-semibold mb-2 text-foreground">
            Allowed File Types
          </Label>
          <Input
            className="w-full h-12"
            placeholder="pdf,doc,docx,jpg,png"
            value={settings.allowed_file_types}
            onChange={(e) => onChange("allowed_file_types", e.target.value)}
          />
        </TextField>
        <p className="text-xs text-foreground mt-1.5">
          Separate with commas (e.g.: pdf,doc,docx)
        </p>
      </div>
      <div className="flex justify-end pt-4 border-t border-divider">
        <Button
          className="bg-primary text-white font-medium px-6"
          isDisabled={loading && savingCategory === "storage"}
          onClick={onSave}
        >
          {savingCategory === "storage" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
