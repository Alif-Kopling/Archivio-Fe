/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable import/order */

import { SidebarUploadPanel } from "@/components/dashboard/SidebarUploadPanel";
import { FC, useEffect, useState, useCallback } from "react";
import { FileDown, Inbox, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@heroui/react";

import api from "@/lib/axios";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  DocumentUploadDialog,
  type DocumentUploadFormState,
  type BulkFileItem,
} from "@/components/documents/DocumentUploadDialog";
import { StorageIndicator } from "@/components/dashboard/StorageIndicator";
import { useNotify } from "@/context/NotificationContext";

// ── Types ───────────────────────────────────────────────────────────────

interface Surat {
  id: string | number;
  title: string;
  sender?: string | null;
  documentDate?: string | null;
  filePath: string;
  type: string;
  status: string;
  createdAt: string;
  size?: string;
}

interface Stats {
  total: number;
  pending: number;
  verified: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_UPLOAD_FORMATS = ".pdf,.doc,.docx";
const ACCEPTED_UPLOAD_FORMATS_LABEL = "PDF, DOC, DOCX";

const STAT_CONFIG = [
  {
    key: "total" as keyof Stats,
    label: "Total Documents",
    Icon: Inbox,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    key: "pending" as keyof Stats,
    label: "Pending / Draft",
    Icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    key: "verified" as keyof Stats,
    label: "Verified / Final",
    Icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeStats(data: Surat[]): Stats {
  return {
    total: data.length,
    pending: data.filter((s) => {
      const status = s.status?.toLowerCase();

      return (
        status === "draft" ||
        status === "pending" ||
        status === "submitted" ||
        status === "review" ||
        status === "waiting"
      );
    }).length,
    verified: data.filter((s) => {
      const status = s.status?.toLowerCase();

      return (
        status === "final" ||
        status === "approved" ||
        status === "approve" ||
        status === "publish" ||
        status === "published"
      );
    }).length,
  };
}

function resolveStats(
  payloadStats: Partial<Stats> | undefined,
  data: Surat[],
): Stats {
  if (
    payloadStats &&
    typeof payloadStats.total === "number" &&
    typeof payloadStats.pending === "number" &&
    typeof payloadStats.verified === "number"
  ) {
    return {
      total: payloadStats.total,
      pending: payloadStats.pending,
      verified: payloadStats.verified,
    };
  }

  return computeStats(data);
}

function stripFileExtension({ fileName }: { fileName: string }): string {
  const baseName = fileName.split(/[\\/]/).pop() || fileName;
  const lastDotIndex = baseName.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return baseName;
  }

  return baseName.slice(0, lastDotIndex);
}

function getDownloadFileName(file: Surat): string {
  const originalName = file.filePath?.split(/[\\/]/).pop();

  if (originalName && originalName.includes(".")) {
    return originalName.replace(/^\d{13}-/, "");
  }

  return file.title || "document.pdf";
}

function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const StatsSection: FC<{ stats: Stats }> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    {STAT_CONFIG.map(({ key, label, Icon, color, bg }) => (
      <StatCard
        key={key}
        Icon={Icon}
        bg={bg}
        color={color}
        count={stats[key]}
        label={label}
      />
    ))}
  </div>
);

import { DocumentRow } from "@/components/documents/DocumentRow";
import { DocumentList } from "@/components/documents/DocumentList";
import { DocumentPreviewDialog } from "@/components/documents/DocumentPreviewDialog";

export default function SuratMasukPage() {
  const [files, setFiles] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<Surat | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    verified: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState<DocumentUploadFormState>({
    title: "",
    documentDate: "",
    sender: "",
    file: null,
  });
  const [bulkFiles, setBulkFiles] = useState<BulkFileItem[]>([]);
  const [uploadMode, setUploadMode] = useState<"single" | "bulk">("single");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const notify = useNotify();
  const todayDate = getTodayDateString();

  const fetchSurat = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/surat-masuk", {
        params: {
          search: searchQuery,
          page,
          limit,
          sortBy,
          sortOrder,
          status: statusFilter,
        },
      });
      const payload = response.data ?? {};
      const data = Array.isArray(payload.data) ? payload.data : [];
      const totalCount =
        typeof payload.total === "number" ? payload.total : data.length;
      const pages =
        typeof payload.totalPages === "number" ? payload.totalPages : 1;

      setFiles(data);
      setTotal(totalCount || 0);
      setTotalPages(pages || 1);
      setStats(resolveStats(payload.stats, data));
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [searchQuery, page, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    setSearchLoading(true);
    const timer = setTimeout(fetchSurat, 500);

    return () => clearTimeout(timer);
  }, [fetchSurat]);

  useEffect(
    () => () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl],
  );

  const openUploadDialog = () => {
    setUploadForm({
      title: "",
      documentDate: todayDate,
      sender: "",
      file: null,
    });
    setUploadOpen(true);
  };

  const closeUploadDialog = () => {
    if (loading) return;
    setUploadOpen(false);
  };

  const handleUploadFieldChange = (
    field: keyof Omit<DocumentUploadFormState, "file">,
    value: string,
  ) => {
    setUploadForm((current) => ({ ...current, [field]: value }));
  };

  const handleUploadFileChange = (file: File | null) => {
    setUploadForm((current) => ({ ...current, file }));
  };

  const handleSubmitUpload = async () => {
    if (!uploadForm.file) {
      notify({
        title: "No File Selected",
        description: "Please choose a file first.",
        status: "warning",
      });

      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("file", uploadForm.file);
      formData.append("title", uploadForm.title.trim());
      formData.append("documentDate", uploadForm.documentDate);
      formData.append("sender", uploadForm.sender.trim());
      formData.append("status", "draft");

      await api.post("/surat-masuk", formData);
      setUploadOpen(false);
      notify({
        title: "Document Uploaded",
        description:
          "Your document has been submitted and is pending administrator approval.",
        status: "success",
      });
      setUploadForm({
        title: "",
        documentDate: todayDate,
        sender: "",
        file: null,
      });
      fetchSurat();
    } catch (error: any) {
      console.error(
        "Upload surat masuk failed:",
        error?.response?.data || error,
      );
      notify({
        title: "Upload Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkFileChange = (files: FileList | null) => {
    if (!files) return;
    const newFiles: BulkFileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = stripFileExtension({ fileName: file.name });

      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        title,
        sender: "",
        documentDate: todayDate,
        isValid: false,
      });
    }

    setBulkFiles(newFiles);
  };

  const handleBulkItemChange = (id: string, field: string, value: string) => {
    setBulkFiles((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        updated.isValid =
          Boolean(updated.sender.trim()) && Boolean(updated.documentDate);

        return updated;
      }),
    );
  };

  const handleBulkItemRemove = (id: string) => {
    setBulkFiles((current) => current.filter((item) => item.id !== id));
  };

  const handleModeChange = (mode: "single" | "bulk") => {
    setUploadMode(mode);
  };

  const handleBulkSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      bulkFiles.forEach((item, index) => {
        formData.append("files", item.file);
        formData.append(`title_${item.file.name}_${index}`, item.title);
        formData.append(`sender_${item.file.name}_${index}`, item.sender);
        formData.append(
          `documentDate_${item.file.name}_${index}`,
          item.documentDate,
        );
      });

      await api.post("/surat-masuk/bulk", formData);
      notify({
        title: "Bulk Upload Success",
        description: `${bulkFiles.length} documents have been submitted and are pending administrator approval.`,
        status: "success",
      });
      setBulkFiles([]);
      setUploadOpen(false);
      fetchSurat();
    } catch (error: any) {
      console.error("Bulk upload failed:", error?.response?.data || error);
      notify({
        title: "Bulk Upload Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await api.delete(`/surat-masuk/${id}`);
      fetchSurat();
    } catch (error: any) {
      notify({
        title: "Delete Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
    }
  };

  const handleDownload = async (file: Surat) => {
    try {
      const response = await api.get(`/surat-masuk/download/${file.id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", getDownloadFileName(file));
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      notify({
        title: "Download Failed",
        description: "Failed to download document.",
        status: "danger",
      });
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");
    setPreviewFile(null);
    setPreviewLoading(false);
  };

  const handleView = async (file: Surat) => {
    try {
      setPreviewFile(file);
      setPreviewLoading(true);

      const response = await api.get(`/surat-masuk/download/${file.id}`, {
        responseType: "blob",
      });
      const contentType = String(
        response.headers?.["content-type"] || "application/octet-stream",
      );
      const blob = new Blob([response.data], {
        type: contentType,
      });
      const url = window.URL.createObjectURL(blob);

      setPreviewUrl((current) => {
        if (current) {
          window.URL.revokeObjectURL(current);
        }

        return url;
      });
    } catch (error) {
      notify({
        title: "Preview Failed",
        description: "Failed to preview document.",
        status: "danger",
      });
      handleClosePreview();
    } finally {
      setPreviewLoading(false);
    }
  };

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
        onModeChange={handleModeChange}
        onSubmit={handleSubmitUpload}
      />
      <StatsSection stats={stats} />
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
            page={page}
            renderRow={(file) => (
              <DocumentRow
                key={file.id}
                file={file}
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
