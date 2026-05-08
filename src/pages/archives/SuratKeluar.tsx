/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { FC, useEffect, useState, useCallback } from "react";
import {
  FileUp,
  FileText,
  Download,
  Eye,
  Trash2,
  Mail,
  SendHorizonal,
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
  SearchField,
} from "@heroui/react";

import api from "@/lib/axios";
import {
  DocumentUploadDialog,
  type DocumentUploadFormState,
  type BulkFileItem,
} from "@/components/DocumentUploadDialog";
import { StorageIndicator } from "@/components/StorageIndicator";
import { useNotify } from "@/context/NotificationContext";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Surat {
  id: string | number;
  title: string;
  sender?: string | null;
  documentDate?: string | null;
  filePath: string;
  type: string;
  status: string;
  createdAt: string;
  recipient?: string;
  size?: string;
}

interface Stats {
  total: number;
  pending: number;
  verified: number;
}

interface EmailFormState {
  to: string;
  subject: string;
  message: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LIST_LAYOUT = new ListLayout({ rowHeight: 65 });

const STAT_CONFIG = [
  {
    key: "total" as keyof Stats,
    label: "Total Documents",
    Icon: SendHorizonal,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
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

function getFileExt(filePath: string): string {
  return filePath?.split(".").pop()?.toUpperCase() || "FILE";
}

function formatDate(iso?: string | null): string {
  if (!iso) return "-";

  const parsed = new Date(iso);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-US");
}

function isPdfFile(filePath: string): boolean {
  return filePath?.toUpperCase().endsWith(".PDF");
}

function isImageFile(filePath: string): boolean {
  return /\.(png|jpe?g)$/i.test(filePath || "");
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

function stripFileExtension(fileName: string): string {
  const baseName = fileName.split(/[\\/]/).pop() || fileName;
  const lastDotIndex = baseName.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return baseName;
  }

  return baseName.slice(0, lastDotIndex);
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

const UploadPanel: FC<{ loading: boolean; onUploadClick: () => void }> = ({
  loading,
  onUploadClick,
}) => (
  <Card className="border-none bg-content1 shadow-sm h-fit">
    <Card.Header className="flex flex-col items-start px-4 pt-4 pb-1 gap-2">
      <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-500">
        <FileUp size={22} />
      </div>
      <div className="space-y-0.5">
        <h3 className="font-bold text-base tracking-tight text-foreground">
          Outgoing Mail
        </h3>
        <p className="text-default-400 text-[10px] leading-tight">
          Manage outgoing digital archives.
        </p>
      </div>
    </Card.Header>
    <Card.Content className="px-4 pb-4 pt-1 flex flex-col gap-3">
      <Separator className="opacity-30" />
      <p className="text-[11px] text-default-600 leading-snug bg-default-50/50 p-3 rounded-lg border border-default-100 italic">
        Accepted formats: <span className="font-bold text-foreground">PDF</span>{" "}
        or <span className="font-bold text-foreground">DOCX</span>.
      </p>
      <Button
        className="w-full font-bold shadow-md shadow-violet-500/20 h-9 text-[11px] bg-violet-500 text-white rounded-lg flex items-center justify-center gap-2"
        onClick={onUploadClick}
      >
        {!loading && <Plus size={16} strokeWidth={3} />}
        Upload Document
      </Button>
    </Card.Content>
  </Card>
);

const SendEmailDialog: FC<{
  document: Surat | null;
  form: EmailFormState;
  sending: boolean;
  onChange: (field: keyof EmailFormState, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}> = ({ document, form, sending, onChange, onClose, onSubmit }) => {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]">
      <Card className="w-full max-w-lg border-none bg-content1 shadow-2xl">
        <Card.Header className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Send Document via Email
            </h3>
            <p className="mt-1 text-xs text-default-500">
              Document:{" "}
              <span className="font-semibold text-foreground">
                {document.title}
              </span>
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </Card.Header>
        <Card.Content className="space-y-4 px-6 pb-6 pt-3">
          <div className="space-y-1.5">
            <label
              className="text-xs font-bold text-foreground"
              htmlFor="send-email-to"
            >
              Recipient Email
            </label>
            <Input
              id="send-email-to"
              placeholder="name@email.com"
              type="email"
              value={form.to}
              onChange={(e) => onChange("to", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="text-xs font-bold text-foreground"
              htmlFor="send-email-subject"
            >
              Subject
            </label>
            <Input
              id="send-email-subject"
              placeholder="Email subject"
              value={form.subject}
              onChange={(e) => onChange("subject", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="text-xs font-bold text-foreground"
              htmlFor="send-email-message"
            >
              Message
            </label>
            <textarea
              className="min-h-32 w-full rounded-xl border border-default-200 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-violet-500"
              id="send-email-message"
              placeholder="Write your email message here..."
              value={form.message}
              onChange={(e) => onChange("message", e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button isDisabled={sending} variant="tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-violet-500 text-white"
              isDisabled={sending || !form.to.trim()}
              onClick={onSubmit}
            >
              {sending ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

const DocumentRow: FC<{
  file: Surat;
  onView: (file: Surat) => void;
  onDownload: (file: Surat) => void;
  onSendEmail: (file: Surat) => void;
  onDelete: (id: string | number) => void;
}> = ({ file, onView, onDownload, onSendEmail, onDelete }) => {
  const isPdf = file.filePath?.toUpperCase().endsWith(".PDF");
  const normalizedStatus = file.status?.toLowerCase();
  const isFinal =
    normalizedStatus === "final" || normalizedStatus === "approved";
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
        {/* Left: icon + metadata */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center border shadow-sm ${
              isPdf
                ? "bg-danger/10 text-danger border-danger/10"
                : "bg-violet-500/10 text-violet-500 border-violet-500/10"
            }`}
          >
            <FileText size={18} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[13px] font-bold text-foreground truncate">
              {file.title}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[8px] text-default-500 font-black bg-default-100 px-1 py-0.5 rounded leading-none uppercase">
                {getFileExt(file.filePath)}
              </span>
              <span className="text-[10px] text-default-400 font-medium">
                {formatDate(file.documentDate ?? file.createdAt)}
              </span>
              <span className="text-[10px] text-default-400 font-medium">
                {file.sender || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: status + actions */}
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
                      ? "text-default-400 hover:text-violet-500 hover:bg-violet-500/5"
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
              <Tooltip.Content>
                {isFinal
                  ? "View"
                  : isRejected
                    ? "Rejected Document"
                    : "Pending Approval"}
              </Tooltip.Content>
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
              <Tooltip.Content>
                {isFinal
                  ? "Download"
                  : isRejected
                    ? "Rejected Document"
                    : "Pending Approval"}
              </Tooltip.Content>
            </Tooltip>

            <Tooltip delay={0}>
              <Tooltip.Trigger>
                <Button
                  isIconOnly
                  className={`rounded-md w-7 h-7 min-w-7 ${
                    isFinal
                      ? "text-default-400 hover:text-violet-500 hover:bg-violet-500/5"
                      : "text-default-200 cursor-not-allowed opacity-50"
                  }`}
                  isDisabled={!isFinal}
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isFinal) onSendEmail(file);
                  }}
                >
                  <Mail size={14} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                {isFinal
                  ? "Send via Email"
                  : isRejected
                    ? "Rejected Document"
                    : "Pending Approval"}
              </Tooltip.Content>
            </Tooltip>

            <AlertDialog>
              <Tooltip delay={0}>
                <Tooltip.Trigger>
                  <Button
                    isIconOnly
                    className="text-default-400 hover:text-danger hover:bg-danger/5 rounded-md w-7 h-7 min-w-7"
                    size="sm"
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 size={14} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Delete Document</Tooltip.Content>
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
                        ? This action will remove the digital archive
                        permanently from the system and cannot be undone.
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
  files: Surat[];
  searchQuery: string;
  searchLoading: boolean;
  total: number;
  totalPages: number;
  page: number;
  onPageChange: (page: number) => void;
  onSearchChange: (v: string) => void;
  onView: (file: Surat) => void;
  onDownload: (file: Surat) => void;
  onSendEmail: (file: Surat) => void;
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
  onSendEmail,
  onDelete,
}) => (
  <Card className="border-none bg-content1 shadow-sm w-full h-full flex flex-col overflow-hidden">
    <Card.Header className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-5 py-3 gap-3">
      <div className="flex flex-col">
        <h3 className="font-bold text-sm text-foreground">Document List</h3>
        <p className="text-default-400 text-[9px] font-medium tracking-wide">
          Total of <span className="text-violet-500 font-bold">{total}</span>{" "}
          archives found.
        </p>
      </div>
      <SearchField
        className="w-full sm:max-w-[280px]"
        aria-label="Search documents"
        value={searchQuery}
        onChange={onSearchChange}
      >
        <SearchField.Group className="w-full">
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Search documents..." />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>
    </Card.Header>

    <Card.Content className="px-1 pb-1 flex-1 overflow-hidden relative">
      {searchLoading ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-content1/50 backdrop-blur-[1px] gap-2">
          <Spinner size="md" />
          <span className="text-xs font-medium text-default-500">
            Loading documents...
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
              onSendEmail={onSendEmail}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SuratKeluarPage() {
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
  const [selectedDocument, setSelectedDocument] = useState<Surat | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState<DocumentUploadFormState>({
    title: "",
    documentDate: "",
    sender: "",
    file: null,
  });
  const [bulkFiles, setBulkFiles] = useState<BulkFileItem[]>([]);
  const [uploadMode, setUploadMode] = useState<"single" | "bulk">("single");
  const [emailForm, setEmailForm] = useState<EmailFormState>({
    to: "",
    subject: "",
    message: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const notify = useNotify();
  const todayDate = getTodayDateString();

  const fetchSurat = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/surat-keluar", {
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
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [searchQuery, page]);

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
      notify({ title: "No File Selected", description: "Please choose a file first.", status: "warning" });

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

      await api.post("/surat-keluar", formData);
      setUploadOpen(false);
      notify({ title: "Document Uploaded", description: "Your document has been submitted and is pending administrator approval.", status: "success" });
      setUploadForm({
        title: "",
        documentDate: todayDate,
        sender: "",
        file: null,
      });
      fetchSurat();
    } catch (error: any) {
      console.error(
        "Upload surat keluar failed:",
        error?.response?.data || error,
      );
      notify({ title: "Upload Failed", description: error.response?.data?.error ?? error.message, status: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await api.delete(`/surat-keluar/${id}`);
      fetchSurat();
    } catch (error: any) {
      notify({ title: "Delete Failed", description: error.response?.data?.error ?? error.message, status: "danger" });
    }
  };

  const handleDownload = async (file: Surat) => {
    try {
      const response = await api.get(`/surat-keluar/download/${file.id}`, {
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
      notify({ title: "Download Failed", description: "Failed to download document.", status: "danger" });
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

      const response = await api.get(`/surat-keluar/download/${file.id}`, {
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
      notify({ title: "Preview Failed", description: "Failed to preview document.", status: "danger" });
      handleClosePreview();
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleOpenSendEmail = (file: Surat) => {
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

  const handleBulkFileChange = (files: FileList | null) => {
    if (!files) return;
    const newFiles: BulkFileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = stripFileExtension(file.name);
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
        updated.isValid = Boolean(updated.sender.trim()) && Boolean(updated.documentDate);

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
        formData.append(`documentDate_${item.file.name}_${index}`, item.documentDate);
      });

      await api.post("/surat-keluar/bulk", formData);
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
      notify({ title: "Bulk Upload Failed", description: error.response?.data?.error ?? error.message, status: "danger" });
    } finally {
      setLoading(false);
    }
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
      notify({ title: "Email Sent", description: "Email sent successfully.", status: "success" });
      setSelectedDocument(null);
    } catch (error: any) {
      notify({ title: "Email Failed", description: error.response?.data?.error ?? error.message, status: "danger" });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full pb-2 animate-in fade-in duration-500">
      <SendEmailDialog
        document={selectedDocument}
        form={emailForm}
        sending={sendingEmail}
        onChange={handleEmailFieldChange}
        onClose={handleCloseSendEmail}
        onSubmit={handleSendEmail}
      />
      <DocumentUploadDialog
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
        onModeChange={handleModeChange}
        onSubmit={handleSubmitUpload}
      />
      <StatsSection stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch w-full flex-1 min-h-0">
        <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-4">
          <UploadPanel loading={loading} onUploadClick={openUploadDialog} />
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
            searchLoading={searchLoading}
            searchQuery={searchQuery}
            total={total}
            totalPages={totalPages}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onPageChange={setPage}
            onSearchChange={setSearchQuery}
            onSendEmail={handleOpenSendEmail}
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
            tabIndex={0}
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
