import { Button, Input, Label, ListBox, Select, TextField } from "@heroui/react";
import { FC } from "react";

interface DocumentSettingsProps {
  settings: {
    items_per_page: string;
    date_format: string;
    retention_period: string;
  };
  loading: boolean;
  savingCategory: string;
  onChange: (key: string, value: any) => void;
  onSave: () => void;
}

export const DocumentSettings: FC<DocumentSettingsProps> = ({
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
          Items per Page
        </Label>
        <Select
          className="w-full"
          selectedKey={settings.items_per_page}
          onSelectionChange={(key) => onChange("items_per_page", key)}
        >
          <Select.Trigger className="h-12">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="10" textValue="10 items per page">
                10 items per page
              </ListBox.Item>
              <ListBox.Item id="25" textValue="25 items per page">
                25 items per page
              </ListBox.Item>
              <ListBox.Item id="50" textValue="50 items per page">
                50 items per page
              </ListBox.Item>
              <ListBox.Item id="100" textValue="100 items per page">
                100 items per page
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
      <div>
        <Label className="block text-sm font-semibold mb-2 text-foreground">
          Date Format
        </Label>
        <Select
          className="w-full"
          selectedKey={settings.date_format}
          onSelectionChange={(key) => onChange("date_format", key)}
        >
          <Select.Trigger className="h-12">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="DD/MM/YYYY" textValue="DD/MM/YYYY">
                DD/MM/YYYY
              </ListBox.Item>
              <ListBox.Item id="MM/DD/YYYY" textValue="MM/DD/YYYY">
                MM/DD/YYYY
              </ListBox.Item>
              <ListBox.Item id="YYYY-MM-DD" textValue="YYYY-MM-DD">
                YYYY-MM-DD
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
      <div>
        <TextField name="retention_period" type="number">
          <Label className="block text-sm font-semibold mb-2 text-foreground">
            Retention Period (Years)
          </Label>
          <Input
            className="w-full h-12"
            placeholder="5"
            value={settings.retention_period}
            onChange={(e) => onChange("retention_period", e.target.value)}
          />
        </TextField>
        <p className="text-xs text-foreground mt-1.5">
          Documents will be archived after the retention period ends
        </p>
      </div>
      <div className="flex justify-end pt-4 border-t border-divider">
        <Button
          className="bg-primary text-white font-medium px-6"
          isDisabled={loading && savingCategory === "documents"}
          onClick={onSave}
        >
          {savingCategory === "documents" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
