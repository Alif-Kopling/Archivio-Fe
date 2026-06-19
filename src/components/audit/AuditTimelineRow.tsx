import { Table, Chip } from "@heroui/react";
import {
  FileUp,
  CheckCircle,
  XCircle,
  Trash2,
  Download,
  RotateCcw,
  Send,
  AlertTriangle,
  Ban,
  Eye,
} from "lucide-react";
import { type FC } from "react";

export interface AuditEntry {
  id: number;
  userId: number;
  userName: string;
  action: string;
  documentId: number | null;
  documentTitle: string | null;
  detail: string | null;
  createdAt: string;
}

const actionMeta: Record<
  string,
  { label: string; color: string; icon: any; bar: string }
> = {
  create: {
    label: "Upload",
    color: "success",
    icon: FileUp,
    bar: "bg-success",
  },
  approve: {
    label: "Approve",
    color: "primary",
    icon: CheckCircle,
    bar: "bg-primary",
  },
  reject: { label: "Reject", color: "danger", icon: XCircle, bar: "bg-danger" },
  "bulk-approve": {
    label: "Bulk Approve",
    color: "primary",
    icon: CheckCircle,
    bar: "bg-primary",
  },
  "bulk-reject": {
    label: "Bulk Reject",
    color: "danger",
    icon: Ban,
    bar: "bg-danger",
  },
  delete: { label: "Delete", color: "danger", icon: Trash2, bar: "bg-danger" },
  download: {
    label: "Download",
    color: "warning",
    icon: Download,
    bar: "bg-warning",
  },
  withdraw: {
    label: "Withdraw",
    color: "warning",
    icon: RotateCcw,
    bar: "bg-warning",
  },
  "send-email": {
    label: "Send Email",
    color: "secondary",
    icon: Send,
    bar: "bg-secondary",
  },
  "empty-trash": {
    label: "Empty Trash",
    color: "danger",
    icon: AlertTriangle,
    bar: "bg-danger",
  },
};

function getMeta(action: string) {
  return (
    actionMeta[action] || {
      label: action.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      color: "default",
      icon: Eye,
      bar: "bg-default-400",
    }
  );
}

interface AuditTimelineRowProps {
  entry: AuditEntry;
  index: number;
}

export const AuditTimelineRow: FC<AuditTimelineRowProps> = ({
  entry,
  index,
}) => {
  const { label, color, icon: Icon, bar } = getMeta(entry.action);
  const staggerMs = index * 25;

  return (
    <Table.Row
      key={entry.id}
      className="group border-b border-divider/50 transition-all duration-200 hover:bg-default-50 relative"
      style={{ animation: `fadeIn 0.25s ease-out ${staggerMs}ms both` }}
    >
      {/* Timeline bar */}
      <Table.Cell className="pl-4 pr-2 py-3 w-12">
        <div className="flex items-center gap-2">
          <div
            className={`w-0.5 h-8 rounded-full ${bar} opacity-40 group-hover:opacity-70 transition-opacity`}
          />
          <div
            className={`w-7 h-7 rounded-lg ${
              color === "success"
                ? "bg-success/10 text-success"
                : color === "danger"
                  ? "bg-danger/10 text-danger"
                  : color === "warning"
                    ? "bg-warning/10 text-warning"
                    : color === "primary"
                      ? "bg-primary/10 text-primary"
                      : color === "secondary"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-default-100 text-default-500"
            } flex items-center justify-center`}
          >
            <Icon size={13} />
          </div>
        </div>
      </Table.Cell>

      <Table.Cell className="py-3">
        <Chip
          className={`font-bold border-none h-6 px-2.5 text-[10px] ${
            color === "success"
              ? "bg-success/15 text-success"
              : color === "danger"
                ? "bg-danger/15 text-danger"
                : color === "warning"
                  ? "bg-warning/15 text-warning"
                  : color === "primary"
                    ? "bg-primary/15 text-primary"
                    : color === "secondary"
                      ? "bg-secondary/15 text-secondary"
                      : "bg-default-100 text-default-500"
          }`}
          size="sm"
          variant="soft"
        >
          {label}
        </Chip>
      </Table.Cell>

      <Table.Cell className="py-3 max-w-[280px]">
        <p className="text-sm text-foreground truncate group-hover:text-clip transition-all">
          {entry.detail || "-"}
        </p>
      </Table.Cell>

      <Table.Cell className="py-3">
        <span className="text-sm font-medium text-foreground">
          {entry.userName}
        </span>
      </Table.Cell>

      <Table.Cell className="py-3 max-w-[180px]">
        <span className="text-sm text-default-500 truncate block">
          {entry.documentTitle || "-"}
        </span>
      </Table.Cell>

      <Table.Cell className="py-3 text-right">
        <span className="text-xs text-default-400 whitespace-nowrap font-mono">
          {new Date(entry.createdAt).toLocaleString("id-ID", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </Table.Cell>
    </Table.Row>
  );
};
