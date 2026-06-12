import { FC, ReactNode, useMemo, useState } from "react";
import {
  ArrowUpDown,
  X,
  Trash2,
  Upload,
  ChevronLeft,
  ChevronRight,
  SearchX,
  List,
  LayoutGrid,
  Clock,
  CalendarDays,
  Calendar,
  Archive,
  Plus,
} from "lucide-react";
import {
  Card,
  Button,
  Select,
  ListBox,
  SearchField,
  AlertDialog,
  Chip,
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

type ViewMode = "grid" | "list";

function getDateGroup(dateStr: string): { key: string; label: string; Icon: any } {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { key: "upcoming", label: "Upcoming", Icon: Clock };
  if (diffDays === 0) return { key: "today", label: "Today", Icon: Clock };
  if (diffDays <= 7) return { key: "week", label: "This Week", Icon: CalendarDays };
  if (diffDays <= 30) return { key: "month", label: "This Month", Icon: Calendar };
  return { key: "older", label: "Older", Icon: Archive };
}

function groupByDate(files: Document[]): Map<string, Document[]> {
  const groups = new Map<string, Document[]>();
  files.forEach((f) => {
    const dt = f.documentDate ?? f.createdAt;
    const { key } = getDateGroup(dt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(f);
  });
  const order = ["today", "week", "month", "older", "upcoming"];
  return new Map(
    [...groups.entries()].sort(
      (a, b) => order.indexOf(a[0]) - order.indexOf(b[0]),
    ),
  );
}

const quickFilters = [
  { id: "all", label: "All" },
  { id: "final", label: "Verified" },
  { id: "pending", label: "Pending" },
  { id: "rejected", label: "Rejected" },
];

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
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const grouped = useMemo(() => groupByDate(files), [files]);

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-divider bg-content1 p-3 animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-default-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-4/5 rounded bg-default-200" />
              <div className="h-3 w-3/5 rounded bg-default-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmpty = () => (
    <Card className="border-none bg-content1 h-full">
      <Card.Content className="flex flex-col items-center justify-center h-full gap-3 py-16">
        <div className="w-16 h-16 rounded-2xl bg-default-100 flex items-center justify-center">
          <SearchX className="text-default-300" size={28} />
        </div>
        <p className="text-sm text-default-400 font-medium">
          {searchQuery.trim()
            ? `"${searchQuery.trim()}" not found`
            : "No documents available"}
        </p>
        {searchQuery.trim() && (
          <Button
            size="sm"
            variant="ghost"
            className="text-xs font-semibold"
            onPress={() => onSearchChange("")}
          >
            Clear Search
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const renderContent = () => {
    if (searchLoading) return renderSkeleton();
    if (files.length === 0) return renderEmpty();

    return (
      <div className="space-y-6">
        {[...grouped.entries()].map(([groupKey, groupFiles]) => {
          const { label, Icon } = getDateGroup(
            groupFiles[0]?.documentDate ?? groupFiles[0]?.createdAt,
          );
          return (
            <div key={groupKey}>
              <div className="flex items-center gap-2 mb-2 px-0.5">
                <Icon size={13} className="text-default-400" />
                <span className="text-[11px] font-bold text-default-400 uppercase tracking-wider">
                  {label}
                </span>
                <span className="text-[11px] text-default-300">
                  — {groupFiles.length}
                </span>
                <div className="flex-1 h-px bg-divider" />
              </div>
              <motion.div
                layout
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
                    : "flex flex-col gap-2"
                }
              >
                <AnimatePresence mode="popLayout">
                  {groupFiles.map((file, idx) => (
                    <motion.div
                      key={file.id}
                      layout
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      initial={{ opacity: 0, y: 12 }}
                      transition={{
                        delay: idx * 0.025,
                        duration: 0.2,
                        ease: "easeOut",
                      }}
                    >
                      {renderRow(file)}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full relative">
      {/* FAB Upload */}
      <AnimatePresence>
        {!isSelectionMode && onUploadClick && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-30 sm:hidden"
          >
            <Button
              className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25"
              onPress={onUploadClick}
            >
              <Plus size={24} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <AnimatePresence mode="wait">
        {!isSelectionMode ? (
          <motion.div
            key="toolbar"
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
            exit={{ opacity: 0, y: -20 }}
            initial={{ opacity: 0, y: 20 }}
          >
            {/* Top row */}
            <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
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

                {/* View toggle */}
                <div className="flex items-center border border-divider rounded-lg overflow-hidden">
                  <Button
                    isIconOnly
                    aria-label="Grid view"
                    className={`h-8 w-8 min-w-8 rounded-none ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-default-400"}`}
                    size="sm"
                    variant="ghost"
                    onPress={() => setViewMode("grid")}
                  >
                    <LayoutGrid size={14} />
                  </Button>
                  <div className="w-px h-4 bg-divider" />
                  <Button
                    isIconOnly
                    aria-label="List view"
                    className={`h-8 w-8 min-w-8 rounded-none ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-default-400"}`}
                    size="sm"
                    variant="ghost"
                    onPress={() => setViewMode("list")}
                  >
                    <List size={14} />
                  </Button>
                </div>

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
                    className="bg-primary text-primary-foreground font-semibold h-9 hidden sm:flex"
                    size="sm"
                    onPress={onUploadClick}
                  >
                    <Upload size={14} />
                    {uploadLabel}
                  </Button>
                )}
              </div>
            </div>

            {/* Quick filter chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {quickFilters.map((f) => (
                <Chip
                  key={f.id}
                  className={`cursor-pointer transition-all duration-150 h-7 px-2.5 text-[10px] font-bold ${
                    statusFilter === f.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-default-100 text-default-500 hover:bg-default-200"
                  }`}
                  size="sm"
                  variant={statusFilter === f.id ? "primary" : "soft"}
                  onClick={() => onStatusFilterChange(f.id)}
                >
                  {f.label}
                </Chip>
              ))}
              {statusFilter !== "all" && (
                <button
                  className="text-[10px] text-default-400 hover:text-danger shrink-0 font-medium ml-1"
                  onClick={() => onStatusFilterChange("all")}
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="selection-toolbar"
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-4 py-2 bg-primary-50/50 dark:bg-primary-900/10 rounded-xl backdrop-blur-sm border border-primary-200/30"
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

      {/* Document Grid / List */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
        {renderContent()}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1 py-2 mt-auto border-t border-divider/50">
        <span className="text-xs text-default-400">
          Page {page} of {totalPages} ({total} total)
        </span>
        <div className="flex items-center gap-2">
          <Button
            className="h-8 text-xs font-semibold"
            isDisabled={page <= 1}
            size="sm"
            variant="ghost"
            onPress={() => onPageChange(page - 1)}
          >
            <ChevronLeft size={14} />
            Previous
          </Button>
          <Button
            className="h-8 text-xs font-semibold"
            isDisabled={page >= totalPages}
            size="sm"
            variant="ghost"
            onPress={() => onPageChange(page + 1)}
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {/* Floating Batch Bar */}
      <AnimatePresence>
        {isSelectionMode && selectedCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-content1 border border-divider shadow-2xl shadow-black/10 dark:shadow-black/30 backdrop-blur-xl">
              <span className="text-sm font-bold text-foreground whitespace-nowrap">
                {selectedCount} selected
              </span>
              <div className="w-px h-5 bg-divider" />
              {onBulkDelete && (
                <>
                  <AlertDialog
                    isOpen={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteOpen}
                  >
                    <AlertDialog.Trigger>
                      <Button
                        className="text-danger font-bold text-xs h-8"
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 size={14} />
                        Delete
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
                className="text-default-500 font-bold text-xs h-8"
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
    </div>
  );
};