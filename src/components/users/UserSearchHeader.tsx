import { Search, Users, UserCog } from "lucide-react";
import { Card, Chip, SearchField } from "@heroui/react";

interface UserSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  stats: { total: number; admins: number; staff: number };
}

const roleChips = [
  { id: "all", label: "All", icon: Users },
  { id: "admin", label: "Admin", icon: UserCog },
  { id: "staff", label: "Staff", icon: Users },
];

export default function UserSearchHeader({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  stats,
}: UserSearchHeaderProps) {
  const chipCount = (id: string) => {
    if (id === "all") return stats.total;
    if (id === "admin") return stats.admins;
    return stats.staff;
  };

  return (
    <Card.Header className="flex flex-col gap-3 border-b border-divider p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
        <SearchField
          className="w-full sm:max-w-[320px]"
          value={searchQuery}
          onChange={onSearchChange}
        >
          <SearchField.Group className="w-full">
            <SearchField.SearchIcon>
              <Search size={14} />
            </SearchField.SearchIcon>
            <SearchField.Input placeholder="Search by user identity..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {roleChips.map(({ id, label, icon: Icon }) => (
            <Chip
              key={id}
              className={`cursor-pointer transition-all duration-150 h-7 px-2.5 text-[10px] font-bold gap-1 ${
                roleFilter === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-default-100 text-default-500 hover:bg-default-200"
              }`}
              size="sm"
              variant={roleFilter === id ? "primary" : "soft"}
              onClick={() => onRoleFilterChange(id)}
            >
              {roleFilter === id && <Icon size={10} />}
              {label}
              <span className={`${roleFilter === id ? "text-primary-foreground/70" : "text-default-400"}`}>
                {chipCount(id)}
              </span>
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] font-medium italic text-default-400">
        <span className="w-1.5 h-1.5 rounded-full bg-warning" />
        Access privileges are strictly governed by assigned roles.
      </div>
    </Card.Header>
  );
}