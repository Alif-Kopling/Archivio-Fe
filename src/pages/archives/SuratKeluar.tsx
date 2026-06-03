import { useState } from "react";
import { FileUp, SendHorizonal, Clock, CheckCircle2 } from "lucide-react";

import { DocumentPreviewDialog } from "@/components/documents/DocumentPreviewDialog";
import { DocumentUploadDialog } from "@/components/documents/DocumentUploadDialog";
import { StorageIndicator } from "@/components/dashboard/StorageIndicator";
import { DocumentRow } from "@/components/documents/DocumentRow";
import { DocumentList } from "@/components/documents/DocumentList";
import {
  ArchiveStats,
  SendEmailDialog,
  type EmailFormState,
  type StatConfigItem,
} from "@/components/archives";
import { useDocumentManagement } from "@/hooks/useDocumentManagement";
import { useNotify } from "@/context/NotificationContext";
import api from "@/lib/axios";
import { Document } from "@/types/document";

const ACCEPTED_UPLOAD_FORMATS = ".pdf,.doc,.docx";
const ACCEPTED_UPLOAD_FORMATS_LABEL = "PDF, DOC, DOCX";

const STAT_CONFIG: readonly StatConfigItem[] = [
  {
    key: "total",
    label: "Total Documents",
    Icon: SendHorizonal,
    color: "text-violet-500",
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

export default function SuratKeluarPage() {
  const notify = useNotify();
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
  } = useDocumentManagement({ endpoint: "/surat-keluar" });

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailForm, setEmailForm] = useState<EmailFormState>({
    to: "",
    subject: "",
    message: "",
  });

  const handleOpenSendEmail = (file: Document) => {
    setSelectedDocument(file);
    setEmailForm({
      to: "",
      subject: `Document: ${file.title}`,
      message: `Hello,\n\nAttached is the document ${file.title}.\n\nThank you.`,
    });
  };

  const handleCloseSendEmail = () => {
    if (sendingEmail) return;
    setSelectedDocument(null);
  };

  const handleEmailFieldChange = (
    field: keyof EmailFormState,
    value: string,
  ) => {
    setEmailForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendEmail = async () => {
    if (!selectedDocument) return;
    try {
      setSendingEmail(true);
      await api.post(
        `/surat-keluar/${selectedDocument.id}/send-email`,
        emailForm,
      );
      notify({
        title: "Email Sent",
        description: "Email sent successfully.",
        status: "success",
      });
      setSelectedDocument(null);
    } catch (error: any) {
      notify({
        title: "Email Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full pb-2 animate-in fade-in duration-500">
      <SendEmailDialog
        document={selectedDocument}
        form={emailForm}
        sending={sendingEmail}
        onChange={handleEmailFieldChange}
        onClose={handleCloseSendEmail}
        onSubmit={handleSendEmail}
      />
      <DocumentUploadDialog
        acceptedFormats={ACCEPTED_UPLOAD_FORMATS}
        acceptedFormatsLabel={ACCEPTED_UPLOAD_FORMATS_LABEL}
        badgeClassName="bg-violet-500/10 text-violet-500"
        badgeIcon={<FileUp size={22} />}
        bulkFiles={bulkFiles}
        description="Tambahkan metadata sebelum dokumen keluar disimpan."
        form={uploadForm}
        loading={loading}
        open={uploadOpen}
        submitLabel="Upload Document"
        title="Upload Outgoing Document"
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
            onSendEmail={handleOpenSendEmail}
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
