import { AlertCircle } from "lucide-react";
import { Card, SearchField } from "@heroui/react";

interface UserSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function UserSearchHeader({
  searchQuery,
  onSearchChange,
}: UserSearchHeaderProps) {
  return (
    <Card.Header className="flex flex-col gap-4 border-b border-divider p-4 sm:flex-row sm:items-center sm:justify-between">
      <SearchField
        className="w-full sm:max-w-[320px]"
        value={searchQuery}
        onChange={onSearchChange}
      >
        <SearchField.Group className="w-full">
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Search by user identity..." />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>
      <div className="flex items-center gap-2 text-xs font-medium italic text-default-400">
        <AlertCircle size={14} />
        Access privileges are strictly governed by assigned roles.
      </div>
    </Card.Header>
  );
}
