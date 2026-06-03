import { ClipboardCheck } from "lucide-react";
import { FC } from "react";

import { ThemeSwitch } from "@/components/common/theme-switch";

export const ApprovalHeader: FC = () => (
  <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-2xl bg-primary/20 text-primary backdrop-blur-sm shadow-inner">
        <ClipboardCheck size={28} />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Approval System</h1>
        <p className="text-default-500 text-sm">
          Review and verify incoming documents for the archive.
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <ThemeSwitch />
    </div>
  </header>
);
