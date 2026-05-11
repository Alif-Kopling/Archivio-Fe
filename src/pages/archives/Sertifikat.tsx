/* eslint-disable prettier/prettier */
/* eslint-disable import/order */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { FC, useEffect, useState, useRef, useCallback } from "react";
import { Award, Clock, CheckCircle2, Plus, ArrowUpDown } from "lucide-react";
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

import api from "@/lib/axios";
import { StatCard } from "@/components/StatCard";
import { StorageIndicator } from "@/components/StorageIndicator";
import { useNotify } from "@/context/NotificationContext";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Sertifikat {
  id: string | number;
  title: string;
  filePath: string;
  type: string;
  status: string;
  createdAt: string;
  issuer?: string;
  size?: string;
}

interface Stats {
  total: number;
  pending: number;
  verified: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LIST_LAYOUT = new ListLayout({ rowHeight: 65 });

const ACCEPTED_FORMATS = ".pdf,.jpg,.jpeg,.png";

const isPendingStatus = (status?: string) => {
  const normalizedStatus = status?.toLowerCase();

  return (
    normalizedStatus === "pending" ||
    normalizedStatus === "draft" ||
    normalizedStatus === "submitted" ||
    normalizedStatus === "review" ||
    normalizedStatus === "waiting"
  );
};

const isVerifiedStatus = (status?: string) => {
  const normalizedStatus = status?.toLowerCase();

  return (
    normalizedStatus === "final" ||
    normalizedStatus === "approved" ||
    normalizedStatus === "approve" ||
    normalizedStatus === "publish" ||
    normalizedStatus === "published"
  );
};

const STAT_CONFIG = [
  {
    key: "total" as keyof Stats,
    label: "Total Certificates",
    Icon: Award,
    color: "text-amber-500",
    bg: "bg-amber-900/10",
  },
  {
    key: "pending" as keyof Stats,
    label: "Pending / Draft",
    Icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-900/10",
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

function computeStats(data: Sertifikat[]): Stats {
  return {
    total: data.length,
    pending: data.filter((s) => isPendingStatus(s.status)).length,
    verified: data.filter((s) => isVerifiedStatus(s.status)).length,
  };
}

function resolveStats(
  payloadStats: Partial<Stats> | undefined,
  data: Sertifikat[],
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

function getFileExt(filePath: string): string {
  return filePath?.split(".").pop()?.toUpperCase() || "FILE";
}

function isPdfFile({ filePath }: { filePath: string; }): boolean {
  return filePath?.toUpperCase().endsWith(".PDF");
}

function isImageFile(filePath: string): boolean {
  return /\.(png|jpe?g)$/i.test(filePath || "");
}

function getDownloadFileName(file: Sertifikat): string {
  const originalName = file.filePath?.split(/[\\/]/).pop();

  if (originalName && originalName.includes(".")) {
    return originalName.replace(/^\d{13}-/, "");
  }

  return file.title || "certificate.pdf";
}

const StatsSection: FC<{ stats: Stats }> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    {STAT_CONFIG.map(({ key, label, Icon, color, bg }) => (
      <StatCard
        key={key}
        Icon={Icon}
        bg={bg}
        color={color}
        label={label}
        count={stats[key]}
      />
    ))}
  </div>
);

const UploadPanel: FC<{
  loading: boolean;
  issuer: string;
  onUploadClick: () => void;
  onIssuerChange: (value: string) => void;
}> = ({ loading, issuer, onUploadClick, onIssuerChange }) => (
  <Card className="border-none bg-content1 shadow-sm h-fit">
    <Card.Header className="flex flex-col items-start px-4 pt-4 pb-1 gap-2">
      <div className="p-2.5 bg-amber-900/10 rounded-xl text-amber-500">
        <Award size={22} />
      </div>
      <div className="space-y-0.5">
        <h3 className="font-bold text-base tracking-tight text-foreground">
          Certificates
        </h3>
        <p className="text-default-400 text-[10px] leading-tight">
          Manage digital certificates.
        </p>
      </div>
    </Card.Header>
    <Card.Content className="px-4 pb-4 pt-1 flex flex-col gap-3">
      <p className="text-[11px] text-default-600 leading-snug bg-default-50/50 p-3 rounded-lg border border-default-100 italic">
        Accepted: <span className="font-bold text-foreground">PDF</span>,{" "}
        <span className="font-bold text-foreground">JPG</span>, or{" "}
        <span className="font-bold text-foreground">PNG</span>.
      </p>
      <input
        className="w-full h-10 px-4 rounded-lg border border-divider bg-default-100 focus:outline-none focus:ring-2 focus:ring-warning text-sm"
        placeholder="Certificate issuer (optional)"
        type="text"
        value={issuer}
        onChange={(e) => onIssuerChange(e.target.value)}
      />
      <Button
        className="w-full font-bold shadow-md shadow-warning/20 h-9 text-[11px] bg-[#d97706] text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#b45309]"
        onClick={onUploadClick}
      >
        {!loading && <Plus size={16} strokeWidth={3} />}
        Upload Certificate
      </Button>
    </Card.Content>
  </Card>
);

import { DocumentRow } from "@/components/DocumentRow";

const STATUS_FILTER_OPTIONS = [
  { id: "all", label: "All Status" },
  { id: "pending", label: "Pending" },
  { id: "final", label: "Verified" },
  { id: "rejected", label: "Rejected" },
];

const SORT_OPTIONS = [
  { id: "createdAt", label: "Upload Date" },
  { id: "title", label: "Title" },
  { id: "documentDate", label: "Document Date" },
  { id: "status", label: "Status" },
];

const DocumentList: FC<{
  files: Sertifikat[];
  searchQuery: string;
  searchLoading: boolean;
  total: number;
  totalPages: number;
  page: number;
  onPageChange: (page: number) => void;
  onSearchChange: (v: string) => void;
  onView: (file: Sertifikat) => void;
  onDownload: (file: Sertifikat) => void;
  onDelete: (id: string | number) => void;
  statusFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onStatusFilterChange: (v: string) => void;
  onSortByChange: (v: string) => void;
  onSortOrderChange: () => void;
}> = ({
  files,
  searchQuery,
  searchLoading,
  total,
  totalPages,
  page,
  onPageChange,
  onSearchChange,
  onView,
  onDownload,
  onDelete,
  statusFilter,
  sortBy,
  sortOrder,
  onStatusFilterChange,
  onSortByChange,
  onSortOrderChange,
}) => (
  <Card className="border-none bg-content1 shadow-sm w-full h-full flex flex-col overflow-hidden">
    <Card.Header className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-3 gap-3">
      <div className="flex flex-col">
        <h3 className="font-bold text-sm text-foreground">Certificate List</h3>
        <p className="text-default-400 text-[9px] font-medium tracking-wide">
          Total of <span className="text-primary font-bold">{total}</span>{" "}
          certificates found.
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
              {STATUS_FILTER_OPTIONS.map((opt) => (
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
              {SORT_OPTIONS.map((opt) => (
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
          className="w-full sm:max-w-[180px]"
          value={searchQuery}
          onChange={onSearchChange}
        >
          <SearchField.Group className="w-full">
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search certificates..." />
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
            Loading certificates...
          </span>
        </div>
      ) : null}
      <Virtualizer layout={LIST_LAYOUT}>
        <ListBox
          aria-label="Document List"
          className="h-[380px] overflow-y-auto scrollbar-hide"
          items={files}
        >
          {(file) => (
            <DocumentRow
              key={file.id}
              file={file}
              type="certificate"
              onDelete={onDelete}
              onDownload={onDownload}
              onView={onView}
            />
          )}
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

export default function SertifikatPage() {
  const [files, setFiles] = useState<Sertifikat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<Sertifikat | null>(null);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [issuer, setIssuer] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const notify = useNotify();

  const fetchSertifikat = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/sertifikat", {
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
      console.error("Failed to fetch certificates:", error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [searchQuery, page, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    setSearchLoading(true);
    const timer = setTimeout(fetchSertifikat, 500);

    return () => clearTimeout(timer);
  }, [fetchSertifikat]);

  useEffect(
    () => () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl],
  );

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
      setLoading(true);
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
      fetchSertifikat();
    } catch (error: any) {
      notify({
        title: "Upload Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await api.delete(`/sertifikat/${id}`);
      fetchSertifikat();
    } catch (error: any) {
      notify({
        title: "Delete Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
    }
  };

  const handleDownload = async (file: Sertifikat) => {
    try {
      const response = await api.get(`/sertifikat/download/${file.id}`, {
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
        description: "Failed to download certificate.",
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

  const handleView = async (file: Sertifikat) => {
    try {
      setPreviewFile(file);
      setPreviewLoading(true);

      const response = await api.get(`/sertifikat/download/${file.id}`, {
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
        description: "Failed to preview certificate.",
        status: "danger",
      });
      handleClosePreview();
    } finally {
      setPreviewLoading(false);
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
      <StatsSection stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch w-full flex-1 min-h-0">
        <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-4">
          <UploadPanel
            issuer={issuer}
            loading={loading}
            onIssuerChange={setIssuer}
            onUploadClick={handleUploadClick}
          />
          <Card className="border-none bg-content1 shadow-sm">
            <Card.Content className="px-4 py-3">
              <StorageIndicator
                count={stats.total}
                label="Storage Usage"
                showGb={true}
                total={100}
                // @ts-ignore (prop custom untuk warna)
                className="[&_.bg-primary]:bg-warning"
              />
            </Card.Content>
          </Card>
        </div>
        <div className="lg:col-span-9 xl:col-span-10 w-full h-full">
          <DocumentList
            files={files}
            page={page}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="presentation"
          tabIndex={-1}
          onClick={handleClosePreview}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleClosePreview();
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <div
            className="w-full max-w-5xl overflow-hidden rounded-2xl bg-content1 shadow-2xl"
            role="document"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") handleClosePreview();
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-divider px-4 py-3">
              <div className="min-w-0">
                <h3 className="truncate font-bold text-foreground">
                  {previewFile.title}
                </h3>
                <p className="text-xs text-default-500">
                  {getFileExt(previewFile.filePath)} preview
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="font-semibold"
                  size="sm"
                  variant="primary"
                  onClick={() => handleDownload(previewFile)}
                >
                  Download
                </Button>
                <Button size="sm" variant="ghost" onClick={handleClosePreview}>
                  Close
                </Button>
              </div>
            </div>
            <div className="min-h-[60vh] bg-black/5 p-4">
              {previewLoading ? (
                <div className="flex min-h-[60vh] items-center justify-center">
                  <Spinner size="md" />
                </div>
              ) : isImageFile(previewFile.filePath) ? (
                <img
                  alt={previewFile.title}
                  className="mx-auto max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
                  src={previewUrl}
                />
              ) : isPdfFile({ filePath: previewFile.filePath }) ? (
                <iframe
                  className="h-[70vh] w-full rounded-lg bg-white"
                  src={previewUrl}
                  title={previewFile.title}
                />
              ) : (
                <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
                  <p className="text-sm font-medium text-default-600">
                    Preview is not available for this file type.
                  </p>
                  <Button
                    className="font-semibold"
                    size="sm"
                    variant="primary"
                    onClick={() => handleDownload(previewFile)}
                  >
                    Download instead
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
