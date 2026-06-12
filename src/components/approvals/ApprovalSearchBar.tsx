import { SearchField, Chip } from "@heroui/react";
import { FC, memo } from "react";
import { Search, Inbox, Send, Award } from "lucide-react";

interface ApprovalSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  stats: { incoming: number; outgoing: number; certificate: number };
}

const sourceChips = [
  { id: "all", label: "All", icon: Search },
  { id: "incoming", label: "Incoming", icon: Inbox },
  { id: "outgoing", label: "Outgoing", icon: Send },
  { id: "certificate", label: "Certificate", icon: Award },
];

export const ApprovalSearchBar: FC<ApprovalSearchBarProps> = memo(
  ({ searchQuery, onSearchChange, sourceFilter, onSourceFilterChange, stats }) => {
    const chipCount = (id: string) => {
      if (id === "all") return stats.incoming + stats.outgoing + stats.certificate;
      if (id === "incoming") return stats.incoming;
      if (id === "outgoing") return stats.outgoing;
      return stats.certificate;
    };

    return (
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h4 className="text-lg font-bold text-foreground">Pending Documents</h4>
            <p className="text-sm text-default-500">
              Review documents waiting in the queue.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <SearchField
              aria-label="Search pending documents"
              className="w-full lg:max-w-[320px]"
              value={searchQuery}
              onChange={onSearchChange}
            >
              <SearchField.Group className="w-full">
                <SearchField.SearchIcon>
                  <Search size={14} />
                </SearchField.SearchIcon>
                <SearchField.Input placeholder="Search documents..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
          </div>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {sourceChips.map(({ id, label, icon: Icon }) => (
            <Chip
              key={id}
              className={`cursor-pointer transition-all duration-150 h-7 px-2.5 text-[10px] font-bold gap-1 ${
                sourceFilter === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-default-100 text-default-500 hover:bg-default-200"
              }`}
              size="sm"
              variant={sourceFilter === id ? "primary" : "soft"}
              onClick={() => onSourceFilterChange(id)}
            >
              {sourceFilter === id && <Icon size={10} />}
              {label}
              <span className={`${sourceFilter === id ? "text-primary-foreground/70" : "text-default-400"}`}>
                {chipCount(id)}
              </span>
            </Chip>
          ))}
        </div>
      </div>
    );
  },
);

ApprovalSearchBar.displayName = "ApprovalSearchBar";