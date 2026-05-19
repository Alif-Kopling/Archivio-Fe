import { FC, ReactNode } from "react";
import { ArrowUpDown } from "lucide-react";
import {
  Card,
  Button,
  Spinner,
  Virtualizer,
  ListBox,
  ListLayout,
  SearchField,
  Select,
} from "@heroui/react";

import { Document } from "@/types/document";

interface DocumentListProps {
  files: Document[];
  total: number;
  totalPages: number;
  page: number;
  searchQuery: string;
  searchLoading: boolean;
  statusFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  renderRow: (file: Document) => ReactNode;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: () => void;
  onDelete?: (id: string | number) => void;
  onDownload?: (file: Document) => void;
  onView?: (file: Document) => void;
  onSendEmail?: (file: Document) => void;
  statusOptions?: { id: string; label: string }[];
  sortOptions?: { id: string; label: string }[];
}

const LIST_LAYOUT = new ListLayout({ rowHeight: 65 });

export const DocumentList: FC<DocumentListProps> = ({
  files,
  total,
  totalPages,
  page,
  searchQuery,
  searchLoading,
  statusFilter,
  sortBy,
  sortOrder,
  renderRow,
  onPageChange,
  onSearchChange,
  onStatusFilterChange,
  onSortByChange,
  onSortOrderChange,
  statusOptions = [
    { id: "all", label: "All Status" },
    { id: "pending", label: "Pending" },
    { id: "final", label: "Verified" },
    { id: "rejected", label: "Rejected" },
  ],
  sortOptions = [
    { id: "createdAt", label: "Upload Date" },
    { id: "title", label: "Title" },
    { id: "documentDate", label: "Document Date" },
    { id: "status", label: "Status" },
  ],
}) => {
  return (
    <Card className="border-none bg-content1 shadow-sm w-full h-full flex flex-col overflow-hidden">
      <Card.Header className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-3 gap-3">
        <div className="flex flex-col">
          <h3 className="font-bold text-sm text-foreground">Document List</h3>
          <p className="text-default-400 text-[9px] font-medium tracking-wide">
            Total of <span className="text-primary font-bold">{total}</span>{" "}
            archives found.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Select
            aria-label="Filter by status"
            className="w-[110px]"
            selectedKey={statusFilter}
            onSelectionChange={(key) => onStatusFilterChange(String(key))}
          >
            <Select.Trigger className="h-9 min-h-9">
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {statusOptions.map((opt) => (
                  <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                    {opt.label}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
          <Select
            aria-label="Sort by"
            className="w-[120px]"
            selectedKey={sortBy}
            onSelectionChange={(key) => onSortByChange(String(key))}
          >
            <Select.Trigger className="h-9 min-h-9">
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {sortOptions.map((opt) => (
                  <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label}>
                    {opt.label}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
          <Button
            isIconOnly
            aria-label="Toggle sort direction"
            className="h-9 w-9 min-w-9 text-default-400"
            variant="ghost"
            onPress={onSortOrderChange}
          >
            <ArrowUpDown
              className={`transition-transform duration-200 ${sortOrder === "asc" ? "rotate-180" : ""}`}
              size={16}
            />
          </Button>
          <SearchField
            aria-label="Search documents"
            className="w-full sm:max-w-[180px]"
            value={searchQuery}
            onChange={onSearchChange}
          >
            <SearchField.Group className="w-full">
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search documents..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>
      </Card.Header>

      <Card.Content className="px-1 pb-1 flex-1 overflow-hidden relative">
        {searchLoading ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-content1/50 backdrop-blur-[1px] gap-2">
            <Spinner size="md" />
            <span className="text-xs font-medium text-default-500">
              Loading documents...
            </span>
          </div>
        ) : null}
        <Virtualizer layout={LIST_LAYOUT}>
          <ListBox
            aria-label="Document List"
            className="h-[380px] overflow-y-auto scrollbar-hide"
            items={files}
          >
            {renderRow}
          </ListBox>
        </Virtualizer>
      </Card.Content>
      {totalPages > 1 ? (
        <Card.Footer className="flex justify-center gap-2 px-5 py-3">
          <Button
            isDisabled={page <= 1}
            size="sm"
            variant="ghost"
            onPress={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center text-xs text-default-500">
            Page {page} of {totalPages}
          </span>
          <Button
            isDisabled={page >= totalPages}
            size="sm"
            variant="ghost"
            onPress={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </Card.Footer>
      ) : null}
    </Card>
  );
};
