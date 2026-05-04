/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { FC, useEffect, useState, useRef, useCallback } from "react";
import {
  Download,
  Eye,
  Trash2,
  Search,
  Award,
  Clock,
  CheckCircle2,
  Plus,
} from "lucide-react";
import {
  Card,
  Button,
  Tooltip,
  Chip,
  Input,
  Spinner,
  Separator,
  Virtualizer,
  ListBox,
  ListLayout,
  AlertDialog,
} from "@heroui/react";

import api from "@/lib/axios";

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US");
}

function isPdfFile(filePath: string): boolean {
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

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard: FC<{
  label: string;
  value: number;
  Icon: FC<{ size?: number }>;
  color: string;
  bg: string;
}> = ({ label, value, Icon, color, bg }) => (
  <Card className="border-none bg-content1 shadow-sm transition-transform hover:scale-[1.01]">
    <Card.Content className="flex items-center gap-3 p-3">
      <div
        className={`p-3 rounded-xl ${bg} ${color} flex items-center justify-center`}
      >
        <Icon size={20} />
      </div>
      <div className="flex flex-col">
        <span className="text-default-500 text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
        <span className="text-xl font-bold tracking-tight leading-none mt-1">
          {value}
        </span>
      </div>
    </Card.Content>
  </Card>
);

const StatsSection: FC<{ stats: Stats }> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    {STAT_CONFIG.map(({ key, label, Icon, color, bg }) => (
      <StatCard
        key={key}
        Icon={Icon}
        bg={bg}
        color={color}
        label={label}
        value={stats[key]}
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
      <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
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
      <Separator className="opacity-30" />
      <p className="text-[11px] text-default-600 leading-snug bg-default-50/50 p-3 rounded-lg border border-default-100 italic">
        Accepted: <span className="font-bold text-foreground">PDF</span>,{" "}
        <span className="font-bold text-foreground">JPG</span>, or{" "}
        <span className="font-bold text-foreground">PNG</span>.
      </p>
      <input
        className="w-full h-10 px-4 rounded-lg border border-divider bg-default-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        placeholder="Certificate issuer (optional)"
        type="text"
        value={issuer}
        onChange={(e) => onIssuerChange(e.target.value)}
      />
      <Button
        className="w-full font-bold shadow-md shadow-primary/20 h-9 text-[11px] bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2"
        onClick={onUploadClick}
      >
        {!loading && <Plus size={16} strokeWidth={3} />}
        Upload Certificate
      </Button>
    </Card.Content>
  </Card>
);

const DocumentRow: FC<{
  file: Sertifikat;
  onView: (file: Sertifikat) => void;
  onDownload: (file: Sertifikat) => void;
  onDelete: (id: string | number) => void;
}> = ({ file, onView, onDownload, onDelete }) => {
  const normalizedStatus = file.status?.toLowerCase();
  const isFinal = isVerifiedStatus(file.status);
  const isRejected = normalizedStatus === "rejected";
  const statusLabel = isFinal
    ? "VERIFIED"
    : isRejected
      ? "REJECTED"
      : "PENDING";
  const statusColor = isFinal ? "success" : isRejected ? "danger" : "warning";

  return (
    <ListBox.Item
      key={file.id}
      className="py-2 px-3 border-b border-divider/10 hover:bg-default-100/50 rounded-none first:rounded-t-lg last:rounded-b-lg last:border-none transition-colors"
      textValue={file.title}
    >
      <div className="flex items-center justify-between w-full gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center border shadow-sm bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Award size={18} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-foreground truncate">
                {file.title}
              </span>
              <span className="text-[9px] font-black bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                Certificate
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {file.issuer ? (
                <span className="text-[10px] text-primary font-semibold">
                  {file.issuer}
                </span>
              ) : null}
              {file.issuer && (
                <span className="text-[8px] text-default-300">•</span>
              )}
              <span className="text-[8px] text-default-500 font-medium bg-default-100 px-1 py-0.5 rounded leading-none uppercase">
                {getFileExt(file.filePath)}
              </span>
              <span className="text-[10px] text-default-400 font-medium">
                {formatDate(file.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Chip
            className="font-black border-none h-5 px-2 text-[9px] tracking-tighter"
            color={statusColor}
            size="sm"
            variant="soft"
          >
            {statusLabel}
          </Chip>

          <div className="flex items-center gap-0.5">
            <Tooltip delay={0}>
              <Tooltip.Trigger>
                <Button
                  isIconOnly
                  className={`rounded-md w-7 h-7 min-w-7 ${
                    isFinal
                      ? "text-default-400 hover:text-primary hover:bg-primary/5"
                      : "text-default-200 cursor-not-allowed opacity-50"
                  }`}
                  isDisabled={!isFinal}
                  size="sm"
                  variant="ghost"
                  onClick={() => isFinal && onView(file)}
                >
                  <Eye size={14} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>View</Tooltip.Content>
            </Tooltip>

            <Tooltip delay={0}>
              <Tooltip.Trigger>
                <Button
                  isIconOnly
                  className={`rounded-md w-7 h-7 min-w-7 ${
                    isFinal
                      ? "text-default-400 hover:text-success hover:bg-success/5"
                      : "text-default-200 cursor-not-allowed opacity-50"
                  }`}
                  isDisabled={!isFinal}
                  size="sm"
                  variant="ghost"
                  onClick={() => isFinal && onDownload(file)}
                >
                  <Download size={14} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Download</Tooltip.Content>
            </Tooltip>

            <AlertDialog>
              <Tooltip delay={0}>
                <Tooltip.Trigger>
                  <Button
                    isIconOnly
                    className="text-default-400 hover:text-danger hover:bg-danger/5 rounded-md w-7 h-7 min-w-7"
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 size={14} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Delete Certificate</Tooltip.Content>
              </Tooltip>
              <AlertDialog.Backdrop>
                <AlertDialog.Container>
                  <AlertDialog.Dialog className="sm:max-w-[400px]">
                    <AlertDialog.CloseTrigger />
                    <AlertDialog.Header>
                      <AlertDialog.Icon status="danger" />
                      <AlertDialog.Heading>
                        Confirm Permanent Deletion
                      </AlertDialog.Heading>
                    </AlertDialog.Header>
                    <AlertDialog.Body>
                      <p className="text-sm text-default-500 leading-relaxed">
                        Are you sure you want to permanently delete{" "}
                        <strong className="text-foreground">
                          {file.title}
                        </strong>
                        ?
                      </p>
                    </AlertDialog.Body>
                    <AlertDialog.Footer>
                      <Button
                        className="font-semibold"
                        slot="close"
                        variant="tertiary"
                      >
                        Cancel
                      </Button>
                      <Button
                        className="font-semibold bg-danger text-white shadow-lg shadow-danger/20"
                        slot="close"
                        variant="danger"
                        onClick={() => onDelete(file.id)}
                      >
                        Confirm Deletion
                      </Button>
                    </AlertDialog.Footer>
                  </AlertDialog.Dialog>
                </AlertDialog.Container>
              </AlertDialog.Backdrop>
            </AlertDialog>
          </div>
        </div>
      </div>
    </ListBox.Item>
  );
};

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
      <div className="w-full sm:max-w-[280px] relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-default-400 z-10"
          size={14}
        />
        <Input
          className="rounded-lg w-full pl-9 pr-9"
          placeholder="Search certificates..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchLoading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 z-10">
            <Spinner color="current" />
          </div>
        ) : null}
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [issuer, setIssuer] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchSertifikat = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/sertifikat", {
        params: { search: searchQuery, page, limit },
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
  }, [searchQuery, page]);

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
      alert(
        "Certificate uploaded successfully. Please wait for Admin to verify your certificate.",
      );
      setIssuer("");
      fetchSertifikat();
    } catch (error: any) {
      alert(`Upload failed: ${error.response?.data?.error ?? error.message}`);
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
      alert(
        `Failed to delete: ${error.response?.data?.error ?? error.message}`,
      );
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
      alert("Failed to download certificate.");
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
      alert("Failed to preview certificate.");
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
        <div className="lg:col-span-3 xl:col-span-2">
          <UploadPanel
            issuer={issuer}
            loading={loading}
            onIssuerChange={setIssuer}
            onUploadClick={handleUploadClick}
          />
        </div>
        <div className="lg:col-span-9 xl:col-span-10 w-full h-full">
          <DocumentList
            files={files}
            page={page}
            searchLoading={searchLoading}
            searchQuery={searchQuery}
            total={total}
            totalPages={totalPages}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onPageChange={setPage}
            onSearchChange={setSearchQuery}
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
              ) : isPdfFile(previewFile.filePath) ? (
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
