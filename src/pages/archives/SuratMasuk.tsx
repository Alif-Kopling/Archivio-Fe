import { FileDown, Inbox, Clock, CheckCircle2 } from "lucide-react";

import { DocumentUploadDialog } from "@/components/documents/DocumentUploadDialog";
import { StorageIndicator } from "@/components/dashboard/StorageIndicator";
import {
  ArchiveStats,
  TabsNavigation,
  type StatConfigItem,
} from "@/components/archives";
import { DocumentRow } from "@/components/documents/DocumentRow";
import { DocumentList } from "@/components/documents/DocumentList";
import { DocumentPreviewDialog } from "@/components/documents/DocumentPreviewDialog";
import { useDocumentManagement } from "@/hooks/useDocumentManagement";

const ACCEPTED_UPLOAD_FORMATS = ".pdf,.doc,.docx";
const ACCEPTED_UPLOAD_FORMATS_LABEL = "PDF, DOC, DOCX";

const STAT_CONFIG: readonly StatConfigItem[] = [
  {
    key: "total",
    label: "Total Documents",
    Icon: Inbox,
    color: "text-blue-500",
  },
  {
    key: "pending",
    label: "Pending / Draft",
    Icon: Clock,
    color: "text-warning",
  },
  {
    key: "verified",
    label: "Verified / Final",
    Icon: CheckCircle2,
    color: "text-success",
  },
] as const;

export default function SuratMasukPage() {
  const {
    files,
    loading,
    previewFile,
    previewUrl,
    previewLoading,
    stats,
    searchQuery,
    searchLoading,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    uploadOpen,
    uploadForm,
    bulkFiles,
    uploadMode,
    page,
    setPage,
    totalPages,
    total,
    openUploadDialog,
    closeUploadDialog,
    handleUploadFieldChange,
    handleUploadFileChange,
    handleSubmitUpload,
    handleDelete,
    handleDownload,
    handleView,
    handleClosePreview,
    handleBulkFileChange,
    handleBulkItemChange,
    handleBulkItemRemove,
    handleBulkSubmit,
    setUploadMode,
    selectedIds,
    isSelectionMode,
    toggleSelection,
    clearSelection,
    handleBulkDelete,
  } = useDocumentManagement({ endpoint: "/surat-masuk" });

  return (
    <div className="flex flex-col gap-4 w-full h-full pb-2">
      <DocumentUploadDialog
        acceptedFormats={ACCEPTED_UPLOAD_FORMATS}
        acceptedFormatsLabel={ACCEPTED_UPLOAD_FORMATS_LABEL}
        badgeClassName="bg-primary/10 text-primary"
        badgeIcon={<FileDown size={22} />}
        bulkFiles={bulkFiles}
        description="Tambahkan metadata sebelum dokumen masuk ke arsip."
        form={uploadForm}
        loading={loading}
        open={uploadOpen}
        submitLabel="Upload Document"
        title="Upload Incoming Document"
        uploadMode={uploadMode}
        onBulkFileChange={handleBulkFileChange}
        onBulkItemChange={handleBulkItemChange}
        onBulkItemRemove={handleBulkItemRemove}
        onBulkSubmit={handleBulkSubmit}
        onClose={closeUploadDialog}
        onFieldChange={handleUploadFieldChange}
        onFileChange={handleUploadFileChange}
        onModeChange={setUploadMode}
        onSubmit={handleSubmitUpload}
      />
      <ArchiveStats configs={STAT_CONFIG} stats={stats as any} />
      <TabsNavigation />
      <div className="flex-1 min-h-0">
        <DocumentList
          files={files}
          isSelectionMode={isSelectionMode}
          page={page}
          renderRow={(file) => (
            <DocumentRow
              key={file.id}
              file={file}
              isSelected={selectedIds.has(file.id)}
              isSelectionMode={isSelectionMode}
              onDelete={handleDelete}
              onDownload={handleDownload}
              onSelect={toggleSelection}
              onView={handleView}
            />
          )}
          searchLoading={searchLoading}
          searchQuery={searchQuery}
          selectedCount={selectedIds.size}
          sortBy={sortBy}
          sortOrder={sortOrder}
          statusFilter={statusFilter}
          total={total}
          totalPages={totalPages}
          uploadLabel="Upload"
          onBulkDelete={handleBulkDelete}
          onClearSelection={clearSelection}
          onPageChange={setPage}
          onSearchChange={setSearchQuery}
          onSortByChange={(v) => {
            setSortBy(v);
            setPage(1);
          }}
          onSortOrderChange={() => {
            setSortOrder((p) => (p === "desc" ? "asc" : "desc"));
            setPage(1);
          }}
          onStatusFilterChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          onUploadClick={openUploadDialog}
        />
      </div>
      <div className="flex items-center justify-between px-1 py-1">
        <div className="flex-1 max-w-xs">
          <StorageIndicator
            showGb
            count={stats.total}
            label="Storage Usage"
            total={100}
          />
        </div>
        <span className="text-[10px] text-default-300">
          Archivio &copy; 2026
        </span>
      </div>
      {previewFile ? (
        <DocumentPreviewDialog
          file={previewFile}
          previewLoading={previewLoading}
          previewUrl={previewUrl}
          onClose={handleClosePreview}
          onDownload={handleDownload}
        />
      ) : null}
    </div>
  );
}
