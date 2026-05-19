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
    <div className="space-y-6">
      <div>
        <Label className="block text-sm font-semibold mb-2 text-foreground">
          Language
        </Label>
        <Select
          className="w-full"
          selectedKey={settings.language}
          onSelectionChange={(key) => onChange("language", key)}
        >
          <Select.Trigger className="h-12">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="id" textValue="Indonesian">
                Indonesian
              </ListBox.Item>
              <ListBox.Item id="en" textValue="English">
                English
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
      <div>
        <Label className="block text-sm font-semibold mb-2 text-foreground">
          Default Theme
        </Label>
        <Select
          className="w-full"
          selectedKey={settings.default_theme}
          onSelectionChange={(key) => onChange("default_theme", key)}
        >
          <Select.Trigger className="h-12">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="system" textValue="System Default">
                System Default
              </ListBox.Item>
              <ListBox.Item id="light" textValue="Light">
                Light
              </ListBox.Item>
              <ListBox.Item id="dark" textValue="Dark">
                Dark
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
      <div className="flex justify-end pt-4 border-t border-divider">
        <Button
          className="bg-primary text-white font-medium px-6"
          isDisabled={loading && savingCategory === "display"}
          onClick={onSave}
        >
          {savingCategory === "display" ? "Saving ..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
