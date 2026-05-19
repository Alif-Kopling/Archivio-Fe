import { Switch } from "@heroui/react";
import { FC } from "react";

interface NotificationSettingsProps {
  settings: {
    email_notification: boolean;
    auto_archive: boolean;
  };
  onChange: (key: string, value: any) => void;
  onSave: (key: string) => void;
}

export const NotificationSettings: FC<NotificationSettingsProps> = ({
  settings,
  onChange,
  onSave,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-lg bg-default-50 hover:bg-default-100 transition-colors">
        <div className="flex-1">
          <p className="font-semibold text-foreground">Email Notifications</p>
          <p className="text-sm text-foreground mt-0.5">
            Send email for documents that need verification
          </p>
        </div>
        <Switch
          isSelected={settings.email_notification}
          onChange={(checked) => {
            onChange("email_notification", checked);
            onSave("email_notification");
          }}
        >
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch>
      </div>
      <div className="flex items-center justify-between p-4 rounded-lg bg-default-50 hover:bg-default-100 transition-colors">
        <div className="flex-1">
          <p className="font-semibold text-foreground">Auto Archive</p>
          <p className="text-sm text-foreground mt-0.5">
            Automatically archive documents after retention period
          </p>
        </div>
        <Switch
          isSelected={settings.auto_archive}
          onChange={(checked) => {
            onChange("auto_archive", checked);
            onSave("auto_archive");
          }}
        >
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch>
      </div>
    </div>
  );
};
