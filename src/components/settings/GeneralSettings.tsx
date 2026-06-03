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
    <div className="p-8 rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">General Settings</h2>
        <p className="text-sm text-default-500">
          Configure your agency identity and branding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField className="col-span-2 md:col-span-1" name="instansi_name">
          <Label className="block text-xs font-bold uppercase tracking-wider mb-2 text-default-600 ml-1">
            Agency Name
          </Label>
          <Input
            className="h-12 bg-white/5 border-white/10"
            placeholder="Enter agency name"
            value={settings.instansi_name}
            onChange={(e) => onChange("instansi_name", e.target.value)}
          />
        </TextField>
        <TextField className="col-span-2 md:col-span-1" name="logo_url">
          <Label className="block text-xs font-bold uppercase tracking-wider mb-2 text-default-600 ml-1">
            Logo URL
          </Label>
          <Input
            className="h-12 bg-white/5 border-white/10"
            placeholder="https://example.com/logo.png"
            value={settings.logo_url}
            onChange={(e) => onChange("logo_url", e.target.value)}
          />
        </TextField>
      </div>

      <div className="flex justify-end pt-4 border-t border-white/10">
        <Button
          className="bg-primary text-white font-bold px-8 h-12 shadow-lg shadow-primary/20"
          isDisabled={loading && savingCategory === "general"}
          onClick={onSave}
        >
          {savingCategory === "general" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
