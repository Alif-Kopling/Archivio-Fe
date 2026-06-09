import { FC } from "react";
import { Button } from "@heroui/react";
import { Activity, Bell, Download } from "lucide-react";

import { ThemeSwitch } from "@/components/common/theme-switch";

interface DashboardHeaderProps {
  onExport: () => void;
  hasData: boolean;
}

const DashboardHeader: FC<DashboardHeaderProps> = ({ onExport, hasData }) => (
  <header className="flex flex-row justify-between items-center shrink-0 h-10">
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
        <Activity size={16} />
      </div>
      <h1 className="text-base font-bold tracking-tight">
        System Control Center
      </h1>
    </div>
    <div className="flex items-center gap-1">
      <Button
        className="text-[10px] font-bold gap-1"
        isDisabled={!hasData}
        size="sm"
        variant="tertiary"
        onPress={onExport}
      >
        <Download size={13} />
        Export CSV
      </Button>
      <Button
        isIconOnly
        aria-label="Notifications"
        className="text-default-500"
        size="sm"
        variant="ghost"
      >
        <Bell size={15} />
      </Button>
      <ThemeSwitch />
    </div>
  </header>
);

export default DashboardHeader;
