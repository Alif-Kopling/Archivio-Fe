import { Button, Input, Label, TextField } from "@heroui/react";
import { FC } from "react";

interface SecuritySettingsProps {
  settings: {
    session_timeout: string;
  };
  loading: boolean;
  savingCategory: string;
  onChange: (key: string, value: any) => void;
  onSave: () => void;
}

export const SecuritySettings: FC<SecuritySettingsProps> = ({
  settings,
  loading,
  savingCategory,
  onChange,
  onSave,
}) => {
  return (
    <div className="p-8 rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Security Settings</h2>
        <p className="text-sm text-default-500">
          Configure security and session policies.
        </p>
      </div>

      <TextField name="session_timeout" type="number">
        <Label className="block text-xs font-bold uppercase tracking-wider mb-2 text-default-600 ml-1">
          Session Timeout (Minutes)
        </Label>
        <Input
          className="h-12 bg-white/5 border-white/10"
          placeholder="30"
          value={settings.session_timeout}
          onChange={(e) => onChange("session_timeout", e.target.value)}
        />
        <p className="text-xs text-default-500 mt-2 ml-1">
          Session will end after a period of inactivity
        </p>
      </TextField>
      
      <div className="flex justify-end pt-4 border-t border-white/10">
        <Button
          className="bg-primary text-white font-bold px-8 h-12 shadow-lg shadow-primary/20"
          isDisabled={loading && savingCategory === "security"}
          onClick={onSave}
        >
          {savingCategory === "security" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
