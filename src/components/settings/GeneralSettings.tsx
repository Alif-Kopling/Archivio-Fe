import { Button, Input, Label, TextField } from "@heroui/react";
import { FC } from "react";

interface GeneralSettingsProps {
  settings: {
    instansi_name: string;
    logo_url: string;
  };
  loading: boolean;
  savingCategory: string;
  onChange: (key: string, value: any) => void;
  onSave: () => void;
}

export const GeneralSettings: FC<GeneralSettingsProps> = ({
  settings,
  loading,
  savingCategory,
  onChange,
  onSave,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <TextField name="instansi_name">
          <Label className="block text-sm font-semibold mb-2 text-foreground">
            Agency Name
          </Label>
          <Input
            className="w-full h-12"
            placeholder="Enter agency name"
            value={settings.instansi_name}
            onChange={(e) => onChange("instansi_name", e.target.value)}
          />
        </TextField>
        <p className="text-xs text-foreground mt-1.5">
          Agency name will be displayed in headers and reports
        </p>
      </div>
      <div>
        <TextField name="logo_url">
          <Label className="block text-sm font-semibold mb-2 text-foreground">
            Logo URL
          </Label>
          <Input
            className="w-full h-12"
            placeholder="https://example.com/logo.png"
            value={settings.logo_url}
            onChange={(e) => onChange("logo_url", e.target.value)}
          />
        </TextField>
        <p className="text-xs text-foreground mt-1.5">
          Logo will be displayed in sidebar and header
        </p>
      </div>
      <div className="flex justify-end pt-4 border-t border-divider">
        <Button
          className="bg-primary text-white font-medium px-6"
          isDisabled={loading && savingCategory === "general"}
          onClick={onSave}
        >
          {savingCategory === "general" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
