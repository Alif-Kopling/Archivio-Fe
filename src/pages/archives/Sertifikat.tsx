import { useRef, useState } from "react";
import { Award, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@heroui/react";

import { SidebarUploadPanel } from "@/components/dashboard/SidebarUploadPanel";
import { DocumentPreviewDialog } from "@/components/documents/DocumentPreviewDialog";
import { StorageIndicator } from "@/components/dashboard/StorageIndicator";
import { ArchiveStats, type StatConfigItem } from "@/components/archives";
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
    bg: "bg-amber-900/10",
  },
  {
    key: "pending",
    label: "Pending / Draft",
    Icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-900/10",
  },
  {
    key: "verified",
    label: "Verified / Final",
    Icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
] as const;

export default function SertifikatPage() {
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [issuer, setIssuer] = useState("");

  const {
    files,
    loading,
    searchLoading,
    previewFile,
    previewUrl,
    previewLoading,
    stats,
    searchQuery,
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
    <div className="flex flex-col gap-3 w-full h-full pb-2 animate-in fade-in duration-500">
      <input
        ref={fileInputRef}
        accept={ACCEPTED_FORMATS}
        className="hidden"
        type="file"
        onChange={handleFileChange}
      />
      <ArchiveStats configs={STAT_CONFIG} stats={stats as any} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch w-full flex-1 min-h-0">
        <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-4">
          <SidebarUploadPanel
            acceptedFormats="PDF, JPG, PNG"
            badgeColor="bg-amber-900/10 text-amber-500"
            buttonColor="bg-[#d97706] text-white hover:bg-[#b45309]"
            buttonShadow="shadow-warning/20"
            description="Manage digital certificates."
            icon={<Award size={22} />}
            loading={loading}
            title="Certificates"
            onUploadClick={handleUploadClick}
          />
          <Card className="border-none bg-content1 shadow-sm">
            <Card.Content className="px-4 py-3">
              <StorageIndicator
                count={stats.total}
                label="Storage Usage"
                showGb={true}
                total={100}
                // @ts-ignore - custom color prop
                className="[&_.bg-primary]:bg-warning"
              />
            </Card.Content>
          </Card>
        </div>
        <div className="lg:col-span-9 xl:col-span-10 w-full h-full">
          <DocumentList
            files={files}
            page={page}
            renderRow={(file) => (
              <DocumentRow
                key={file.id}
                file={file}
                type="certificate"
                onDelete={handleDelete}
                onDownload={handleDownload}
                onView={handleView}
              />
            )}
            searchLoading={searchLoading}
            searchQuery={searchQuery}
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
            onView={handleView}
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
