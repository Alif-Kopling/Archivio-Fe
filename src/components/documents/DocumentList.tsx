import { FC, ReactNode, useState } from "react";
import { ArrowUpDown, X, Trash2 } from "lucide-react";
import {
  Card,
  Button,
  Spinner,
  Virtualizer,
  ListBox,
  ListLayout,
  SearchField,
  Select,
  AlertDialog,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

import { Document } from "@/types/document";

interface DocumentListProps {
  files: Document[];
  total: number;
  totalPages: number;
  page: number;
  searchQuery?: string;
  searchLoading?: boolean;
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
  isSelectionMode?: boolean;
  selectedCount?: number;
  selectedIds?: Set<number | string>;
  onClearSelection?: () => void;
  onBulkDelete?: () => void;
}

const LIST_LAYOUT = new ListLayout({ rowHeight: 65 });

export const DocumentList: FC<DocumentListProps> = ({
  files,
  total,
  totalPages,
  page,
  searchQuery = "",
  searchLoading = false,
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
  isSelectionMode = false,
  selectedCount = 0,
  selectedIds = new Set(),
  onClearSelection,
  onBulkDelete,
}) => {
  const [isDeleteDialogOpen, setIsDeleteOpen] = useState(false);

  return (
    <Card className="border-none bg-content1 shadow-sm w-full h-full flex flex-col overflow-hidden">
      <Card.Header className="px-5 py-3 min-h-[56px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!isSelectionMode ? (
            <motion.div
              key="normal-header"
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-3"
              exit={{ opacity: 0, y: -20 }}
              initial={{ opacity: 0, y: 20 }}
            >
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
            </motion.div>
          ) : (
            <motion.div
              key="selection-header"
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between w-full"
              exit={{ opacity: 0, y: 20 }}
              initial={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center gap-3">
                <Button
                  isIconOnly
                  className="text-default-500"
                  size="sm"
                  variant="ghost"
                  onPress={onClearSelection}
                >
                  <X size={18} />
                </Button>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-primary">
                    {selectedCount} Selected
                  </span>
                  <span className="text-[10px] text-default-400 font-medium">
                    Batch management mode
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onBulkDelete && (
                  <AlertDialog isOpen={isDeleteDialogOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialog.Trigger>
                      <Button
                        className="bg-danger/10 text-danger font-bold text-xs h-9"
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 size={16} />
                        Delete Selected
                      </Button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Backdrop>
                      <AlertDialog.Container>
                        <AlertDialog.Dialog className="sm:max-w-[400px]">
                          <AlertDialog.CloseTrigger />
                          <AlertDialog.Header>
                            <AlertDialog.Icon status="danger" />
                            <AlertDialog.Heading>
                              Confirm Batch Deletion
                            </AlertDialog.Heading>
                          </AlertDialog.Header>
                          <AlertDialog.Body>
                            <p className="text-sm text-default-500">
                              Are you sure you want to permanently delete{" "}
                              <strong className="text-foreground">{selectedCount}</strong> selected documents?
                            </p>
                            <p className="text-[11px] text-danger mt-2 font-medium">
                              This action cannot be undone.
                            </p>
                          </AlertDialog.Body>
                          <AlertDialog.Footer>
                            <Button slot="close" variant="tertiary">
                              Cancel
                            </Button>
                            <Button
                              className="bg-danger text-white font-bold"
                              slot="close"
                              onClick={onBulkDelete}
                            >
                              Confirm Deletion
                            </Button>
                          </AlertDialog.Footer>
                        </AlertDialog.Dialog>
                      </AlertDialog.Container>
                    </AlertDialog.Backdrop>
                  </AlertDialog>
                )}
                <Button
                  className="text-default-500 font-bold text-xs h-9"
                  size="sm"
                  variant="ghost"
                  onPress={onClearSelection}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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

        {!searchLoading && files.length === 0 ? (
          <div className="flex items-center justify-center h-[380px] text-default-400 text-sm italic">
            {searchQuery.trim()
              ? `"${searchQuery.trim()}" not found. Try another search.`
              : "No documents available at the moment"}
          </div>
        ) : (
          <Virtualizer layout={LIST_LAYOUT}>
            <ListBox
              aria-label="Document List"
              className="h-[380px] overflow-y-auto scrollbar-hide"
              // Trik biar checkbox nyala: buat array baru supaya Virtualizer mau gambar ulang
              items={isSelectionMode ? files.map(f => ({ ...f, _selected: selectedIds?.has(f.id) })) : files}
              selectedKeys={selectedIds}
              selectionMode={isSelectionMode ? "multiple" : "none"}
            >
              {renderRow}
            </ListBox>
          </Virtualizer>
        )}
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
