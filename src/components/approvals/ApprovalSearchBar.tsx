import { Input } from "@heroui/react";
import { Search, X } from "lucide-react";
import { FC, memo } from "react";

interface ApprovalSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ApprovalSearchBar: FC<ApprovalSearchBarProps> = memo(
  ({ searchQuery, onSearchChange }) => (
    <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h4 className="text-lg font-bold">Pending Documents</h4>
        <p className="text-sm text-default-500">
          Review documents waiting in the queue.
        </p>
      </div>
      <div className="relative w-full lg:max-w-[320px]">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-default-400"
          size={16}
        />
        <Input
          aria-label="Search pending documents"
          className="w-full pl-10 pr-10"
          placeholder="Search documents u need for approval"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {searchQuery ? (
          <button
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-default-400 transition hover:bg-default-100 hover:text-default-600"
            type="button"
            onClick={() => onSearchChange("")}
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
    </div>
  ),
);

ApprovalSearchBar.displayName = "ApprovalSearchBar";
