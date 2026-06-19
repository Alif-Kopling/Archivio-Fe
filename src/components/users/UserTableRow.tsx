import { Avatar, Chip, Table } from "@heroui/react";
import { Crown, Mail, User, ShieldCheck } from "lucide-react";

import DeleteUserDialog from "./DeleteUserDialog";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  _count?: {
    documents: number;
  };
}

interface UserTableRowProps {
  user: UserData;
  index: number;
  onUserDeleted: () => void;
}

function isAdminRole(role: string): boolean {
  return role.toLowerCase() === "admin";
}

function getStatusSeed(id: number): "active" | "away" | "offline" {
  const mod = id % 7;

  if (mod < 3) return "active";
  if (mod < 5) return "away";

  return "offline";
}

const statusConfig = {
  active: { dot: "bg-success", pulse: "bg-success/30" },
  away: { dot: "bg-warning", pulse: "bg-warning/30" },
  offline: { dot: "bg-default-300", pulse: "bg-default-100" },
};

export default function UserTableRow({
  user,
  index,
  onUserDeleted,
}: UserTableRowProps) {
  const isAdmin = isAdminRole(user.role);
  const documentCount = user._count?.documents ?? 0;
  const status = getStatusSeed(user.id);
  const { dot, pulse } = statusConfig[status];
  const staggerMs = index * 30;

  return (
    <Table.Row
      key={user.id}
      className="group border-b border-white/5 transition-all duration-300 hover:bg-white/5"
      style={{ animation: `fadeIn 0.3s ease-out ${staggerMs}ms both` }}
    >
      <Table.Cell className="px-4 py-3 align-middle">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Avatar
              className={`${isAdmin ? "bg-warning/20 text-warning" : "bg-primary/20 text-primary"} backdrop-blur-sm shadow-sm`}
              size="sm"
            >
              <Avatar.Fallback>
                {isAdmin ? (
                  <Crown className="text-warning" size={14} />
                ) : (
                  <User size={14} />
                )}
              </Avatar.Fallback>
            </Avatar>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-content1 ${dot}`}
            >
              <span
                className={`absolute inset-0 rounded-full animate-ping ${pulse}`}
              />
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
              {user.name}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-default-500">
              <Mail size={10} />
              {user.email}
            </span>
          </div>
        </div>
      </Table.Cell>

      <Table.Cell className="px-4 py-3 align-middle">
        <Chip
          className={`h-6 border-none px-3 text-[10px] font-bold backdrop-blur-md gap-1 ${
            isAdmin
              ? "bg-warning/10 text-warning"
              : "bg-default-100 dark:bg-default-50 text-default-500"
          }`}
          size="sm"
          variant="soft"
        >
          <ShieldCheck size={10} />
          {user.role.toUpperCase()}
        </Chip>
      </Table.Cell>

      <Table.Cell className="px-4 py-3 text-center align-middle">
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-bold text-default-600">
            {documentCount}
          </span>
          {documentCount > 0 && (
            <div className="w-12 h-1 rounded-full bg-default-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isAdmin ? "bg-warning" : "bg-primary"
                }`}
                style={{ width: `${Math.min(documentCount / 5, 100)}%` }}
              />
            </div>
          )}
        </div>
      </Table.Cell>

      <Table.Cell className="px-4 py-3 text-center align-middle">
        <div className="opacity-60 group-hover:opacity-100 transition-all duration-200 group-hover:scale-105">
          <DeleteUserDialog user={user} onSuccess={onUserDeleted} />
        </div>
      </Table.Cell>
    </Table.Row>
  );
}
