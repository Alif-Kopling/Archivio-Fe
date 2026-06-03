import { FC, ReactNode, useState } from "react";
import {
  ArrowUpDown,
  X,
  Trash2,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  Button,
  Select,
  ListBox,
  SearchField,
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
  onUploadClick?: () => void;
  uploadLabel?: string;
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
  onUploadClick,
  uploadLabel = "Upload",
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
  onClearSelection,
  onBulkDelete,
}) => {
  const [isDeleteDialogOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 w-full">
      <AnimatePresence mode="wait">
        {!isSelectionMode ? (
          <motion.div
            key="toolbar"
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            exit={{ opacity: 0, y: -20 }}
            initial={{ opacity: 0, y: 20 }}
          >
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-foreground">Documents</h2>
              <p className="text-xs text-default-400">
                <span className="text-primary font-semibold">{total}</span>{" "}
                total archives
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
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
              <Select
                aria-label="Filter by status"
                className="w-[110px]"
                selectedKey={statusFilter as any}
                onSelectionChange={(key) => onStatusFilterChange(String(key))}
              >
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {statusOptions.map((opt) => (
                      <ListBox.Item
                        key={opt.id}
                        id={opt.id}
                        textValue={opt.label}
                      >
                        {opt.label}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
              <Select
                aria-label="Sort by"
                className="w-[120px]"
                selectedKey={sortBy as any}
                onSelectionChange={(key) => onSortByChange(String(key))}
              >
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {sortOptions.map((opt) => (
                      <ListBox.Item
                        key={opt.id}
                        id={opt.id}
                        textValue={opt.label}
                      >
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
                size="sm"
                variant="ghost"
                onPress={onSortOrderChange}
              >
                <ArrowUpDown
                  className={`transition-transform duration-200 ${sortOrder === "asc" ? "rotate-180" : ""}`}
                  size={16}
                />
              </Button>
              {onUploadClick && (
                <Button
                  className="bg-primary text-primary-foreground font-semibold h-9"
                  size="sm"
                  onPress={onUploadClick}
                >
                  <Upload size={14} />
                  {uploadLabel}
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="selection-toolbar"
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-4 py-2 bg-primary-50/50 dark:bg-primary-900/10 rounded-xl"
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
                <>
                  <AlertDialog
                    isOpen={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteOpen}
                  >
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
                              <strong className="text-foreground">
                                {selectedCount}
                              </strong>{" "}
                              selected documents?
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
                </>
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

      {searchLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-none bg-content1 animate-pulse">
              <Card.Content className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-default-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/5 rounded bg-default-200" />
                    <div className="h-3 w-2/5 rounded bg-default-100" />
                  </div>
                  <div className="h-5 w-16 rounded bg-default-200" />
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      ) : files.length === 0 ? (
        <Card className="border-none bg-content1">
          <Card.Content className="flex flex-col items-center justify-center py-16 gap-3">
            <Upload className="text-default-300" size={40} />
            <p className="text-sm text-default-400 font-medium">
              {searchQuery.trim()
                ? `"${searchQuery.trim()}" not found. Try another search.`
                : "No documents available at the moment"}
            </p>
            {searchQuery.trim() && (
              <Button
                size="sm"
                variant="ghost"
                onPress={() => onSearchChange("")}
              >
                Clear Search
              </Button>
            )}
          </Card.Content>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {files.map((file, idx) => (
              <motion.div
                key={file.id}
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: idx * 0.03, duration: 0.2 }}
              >
                <Card
                  className={`border-none bg-content1 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.002] ${isSelectionMode && (file as any)._selected ? "ring-2 ring-primary" : ""}`}
                >
                  <Card.Content className="px-4 py-2.5">
                    {renderRow(file)}
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-2">
          <span className="text-xs text-default-400">
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex items-center gap-2">
            <Button
              isDisabled={page <= 1}
              className="h-8 text-xs font-semibold"
              size="sm"
              variant="ghost"
              onPress={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={14} />
              Previous
            </Button>
            <Button
              isDisabled={page >= totalPages}
              className="h-8 text-xs font-semibold"
              size="sm"
              variant="ghost"
              onPress={() => onPageChange(page + 1)}
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
