import { ThemeSwitch } from "@/components/common/theme-switch";
import { ClipboardCheck } from "lucide-react";
import { FC } from "react";

export const ApprovalHeader: FC = () => (
  <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-primary/10 text-primary">
        <ClipboardCheck size={24} />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Approval System</h1>
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
