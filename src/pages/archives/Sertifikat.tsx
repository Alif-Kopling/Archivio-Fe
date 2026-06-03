import { useRef, useState } from "react";
import { Award, Clock, CheckCircle2 } from "lucide-react";

import { DocumentPreviewDialog } from "@/components/documents/DocumentPreviewDialog";
import { StorageIndicator } from "@/components/dashboard/StorageIndicator";
import {
  ArchiveStats,
  TabsNavigation,
  type StatConfigItem,
} from "@/components/archives";
import { DocumentRow } from "@/components/documents/DocumentRow";
import { DocumentList } from "@/components/documents/DocumentList";
import { useDocumentManagement } from "@/hooks/useDocumentManagement";
import { useNotify } from "@/context/NotificationContext";
import api from "@/lib/axios";

const ACCEPTED_FORMATS = ".pdf,.jpg,.jpeg,.png";

const STAT_CONFIG: readonly StatConfigItem[] = [
  {
    key: "total",
    label: "Total Certificates",
    Icon: Award,
    color: "text-amber-500",
  },
  {
    key: "pending",
    label: "Pending / Draft",
    Icon: Clock,
    color: "text-amber-500",
  },
  {
    key: "verified",
    label: "Verified / Final",
    Icon: CheckCircle2,
    color: "text-success",
  },
] as const;

export default function SertifikatPage() {
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [issuer, setIssuer] = useState("");

  const {
    files,
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
    page,
    setPage,
    totalPages,
    total,
    handleDelete,
    handleDownload,
    handleView,
    handleClosePreview,
    fetchDocuments,
    selectedIds,
    isSelectionMode,
    toggleSelection,
    clearSelection,
    handleBulkDelete,
  } = useDocumentManagement({ endpoint: "/sertifikat" });

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);
    formData.append("title", file.name);
    formData.append("status", "pending");
    if (issuer) {
      formData.append("issuer", issuer);
    }

    try {
      await api.post("/sertifikat", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      notify({
        title: "Certificate Uploaded",
        description:
          "Your document has been submitted and is pending administrator approval.",
        status: "success",
      });
      setIssuer("");
      fetchDocuments();
    } catch (error: any) {
      notify({
        title: "Upload Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full pb-2 ">
      <input
        ref={fileInputRef}
        accept={ACCEPTED_FORMATS}
        className="hidden"
        type="file"
        onChange={handleFileChange}
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
              type="certificate"
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
          uploadLabel="Upload Certificate"
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
          onUploadClick={handleUploadClick}
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
