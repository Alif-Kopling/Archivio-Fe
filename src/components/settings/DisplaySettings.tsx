import { Button, Label, ListBox, Select } from "@heroui/react";
import { FC } from "react";

interface DisplaySettingsProps {
  settings: {
    language: string;
    default_theme: string;
  };
  loading: boolean;
  savingCategory: string;
  onChange: (key: string, value: any) => void;
  onSave: () => void;
}

export const DisplaySettings: FC<DisplaySettingsProps> = ({
  settings,
  loading,
  savingCategory,
  onChange,
  onSave,
}) => {
  return (
    <div className="p-8 rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Display Settings</h2>
        <p className="text-sm text-default-500">
          Customize your experience with language and themes.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2 md:col-span-1">
          <Label className="block text-xs font-bold uppercase tracking-wider mb-2 text-default-600 ml-1">
            Language
          </Label>
          <Select
            className="w-full"
            selectedKey={settings.language}
            onSelectionChange={(key) => onChange("language", key)}
          >
            <Select.Trigger className="h-12 bg-white/5 border-white/10">
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="id" textValue="Indonesian">Indonesian</ListBox.Item>
                <ListBox.Item id="en" textValue="English">English</ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
        <div className="col-span-2 md:col-span-1">
          <Label className="block text-xs font-bold uppercase tracking-wider mb-2 text-default-600 ml-1">
            Default Theme
          </Label>
          <Select
            className="w-full"
            selectedKey={settings.default_theme}
            onSelectionChange={(key) => onChange("default_theme", key)}
          >
            <Select.Trigger className="h-12 bg-white/5 border-white/10">
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="system" textValue="System Default">System Default</ListBox.Item>
                <ListBox.Item id="light" textValue="Light">Light</ListBox.Item>
                <ListBox.Item id="dark" textValue="Dark">Dark</ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-white/10">
        <Button
          className="bg-primary text-white font-bold px-8 h-12 shadow-lg shadow-primary/20"
          isDisabled={loading && savingCategory === "display"}
          onClick={onSave}
        >
          {savingCategory === "display" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
