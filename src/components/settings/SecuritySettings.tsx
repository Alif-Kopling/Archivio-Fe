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
    <div className="space-y-6">
      <div>
        <TextField name="session_timeout" type="number">
          <Label className="block text-sm font-semibold mb-2 text-foreground">
            Session Timeout (Minutes)
          </Label>
          <Input
            className="w-full h-12"
            placeholder="30"
            value={settings.session_timeout}
            onChange={(e) => onChange("session_timeout", e.target.value)}
          />
        </TextField>
        <p className="text-xs text-foreground mt-1.5">
          Session will end after a period of inactivity
        </p>
      </div>
      <div className="flex justify-end pt-4 border-t border-divider">
        <Button
          className="bg-primary text-white font-medium px-6"
          isDisabled={loading && savingCategory === "security"}
          onClick={onSave}
        >
          {savingCategory === "security" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
