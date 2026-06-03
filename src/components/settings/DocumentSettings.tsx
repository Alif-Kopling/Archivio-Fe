import {
  Button,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
} from "@heroui/react";
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
    <div className="p-8 rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Document Settings</h2>
        <p className="text-sm text-default-500">
          Manage how documents are displayed and retained.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2 md:col-span-1">
          <Label className="block text-xs font-bold uppercase tracking-wider mb-2 text-default-600 ml-1">
            Items per Page
          </Label>
          <Select
            className="w-full"
            selectedKey={settings.items_per_page}
            onSelectionChange={(key) => onChange("items_per_page", key)}
          >
            <Select.Trigger className="h-12 bg-white/5 border-white/10">
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="10" textValue="10 items per page">
                  10 items
                </ListBox.Item>
                <ListBox.Item id="25" textValue="25 items per page">
                  25 items
                </ListBox.Item>
                <ListBox.Item id="50" textValue="50 items per page">
                  50 items
                </ListBox.Item>
                <ListBox.Item id="100" textValue="100 items per page">
                  100 items
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
        <div className="col-span-2 md:col-span-1">
          <Label className="block text-xs font-bold uppercase tracking-wider mb-2 text-default-600 ml-1">
            Date Format
          </Label>
          <Select
            className="w-full"
            selectedKey={settings.date_format}
            onSelectionChange={(key) => onChange("date_format", key)}
          >
            <Select.Trigger className="h-12 bg-white/5 border-white/10">
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
        <TextField className="col-span-2" name="retention_period" type="number">
          <Label className="block text-xs font-bold uppercase tracking-wider mb-2 text-default-600 ml-1">
            Retention Period (Years)
          </Label>
          <Input
            className="h-12 bg-white/5 border-white/10"
            placeholder="5"
            value={settings.retention_period}
            onChange={(e) => onChange("retention_period", e.target.value)}
          />
        </TextField>
      </div>

      <div className="flex justify-end pt-4 border-t border-white/10">
        <Button
          className="bg-primary text-white font-bold px-8 h-12 shadow-lg shadow-primary/20"
          isDisabled={loading && savingCategory === "documents"}
          onClick={onSave}
        >
          {savingCategory === "documents" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
