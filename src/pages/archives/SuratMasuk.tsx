import { FileDown, Inbox, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@heroui/react";

import { SidebarUploadPanel } from "@/components/dashboard/SidebarUploadPanel";
import { DocumentUploadDialog } from "@/components/documents/DocumentUploadDialog";
import { StorageIndicator } from "@/components/dashboard/StorageIndicator";
import { ArchiveStats, type StatConfigItem } from "@/components/archives";
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
    bg: "bg-blue-500/10",
  },
  {
    key: "pending",
    label: "Pending / Draft",
    Icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    key: "verified",
    label: "Verified / Final",
    Icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
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
    <div className="flex flex-col gap-3 w-full h-full pb-2 animate-in fade-in duration-500">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch w-full flex-1 min-h-0">
        <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-4">
          <SidebarUploadPanel
            acceptedFormats={ACCEPTED_UPLOAD_FORMATS_LABEL}
            description="Manage incoming digital archives."
            icon={<FileDown size={22} />}
            loading={loading}
            title="Incoming Mail"
            onUploadClick={openUploadDialog}
          />
          <Card className="border-none bg-content1 shadow-sm">
            <Card.Content className="px-4 py-3">
              <StorageIndicator
                count={stats.total}
                label="Storage Usage"
                showGb={true}
                total={100}
              />
            </Card.Content>
          </Card>
        </div>
        <div className="lg:col-span-9 xl:col-span-10 w-full h-full">
          <DocumentList
            files={files}
            isSelectionMode={isSelectionMode}
            page={page}
            selectedCount={selectedIds.size}
            onBulkDelete={handleBulkDelete}
            onClearSelection={clearSelection}
            renderRow={(file) => (
              <DocumentRow
                key={file.id}
                file={file}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.has(file.id)}
                onDelete={handleDelete}
                onDownload={handleDownload}
                onSelect={toggleSelection}
                onView={handleView}
              />
            )}
            selectedIds={selectedIds}
            sortBy={sortBy}
            sortOrder={sortOrder}
            statusFilter={statusFilter}
            total={total}
            totalPages={totalPages}
            onDelete={handleDelete}
            onDownload={handleDownload}
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
          />
        </div>
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
