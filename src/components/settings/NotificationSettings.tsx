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
    <div className="p-8 rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Notifications</h2>
        <p className="text-sm text-default-500">
          Manage how you receive alerts and system updates.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
          <div className="flex-1">
            <p className="font-bold text-foreground">Email Notifications</p>
            <p className="text-sm text-default-500 mt-1">
              Send email for documents that need verification
            </p>
          </div>
          <Switch
            color="primary"
            isSelected={settings.email_notification}
            size="md"
            onValueChange={(checked) => {
              onChange("email_notification", checked);
              onSave("email_notification");
            }}
          />
        </div>
        <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
          <div className="flex-1">
            <p className="font-bold text-foreground">Auto Archive</p>
            <p className="text-sm text-default-500 mt-1">
              Automatically archive documents after retention period
            </p>
          </div>
          <Switch
            color="primary"
            isSelected={settings.auto_archive}
            size="md"
            onValueChange={(checked) => {
              onChange("auto_archive", checked);
              onSave("auto_archive");
            }}
          />
        </div>
      </div>
    </div>
  );
};
