import { Avatar, Chip, Table } from "@heroui/react";
import { Crown, Mail, User } from "lucide-react";

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
  onUserDeleted: () => void;
}

function isAdminRole(role: string): boolean {
  return role.toLowerCase() === "admin";
}

export default function UserTableRow({
  user,
  onUserDeleted,
}: UserTableRowProps) {
  const isAdmin = isAdminRole(user.role);
  const documentCount = user._count?.documents ?? 0;

  return (
    <Table.Row
      key={user.id}
      className="group border-b border-white/5 transition-all duration-300 hover:bg-white/5"
    >
      <Table.Cell className="px-4 py-3 align-middle">
        <div className="flex items-center gap-3">
          <Avatar
            className="bg-primary/20 text-primary backdrop-blur-sm shadow-sm"
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
          className="h-6 border-none px-3 text-[10px] font-bold backdrop-blur-md"
          color={isAdmin ? "warning" : "default"}
          size="sm"
          variant="flat"
        >
          {user.role.toUpperCase()}
        </Chip>
      </Table.Cell>

      <Table.Cell className="px-4 py-3 text-center align-middle">
        <span className="text-sm font-semibold text-default-600">
          {documentCount}
        </span>
      </Table.Cell>

      <Table.Cell className="px-4 py-3 text-center align-middle">
        <div className="opacity-60 group-hover:opacity-100 transition-opacity">
          <DeleteUserDialog user={user} onSuccess={onUserDeleted} />
        </div>
      </Table.Cell>
    </Table.Row>
  );
}
