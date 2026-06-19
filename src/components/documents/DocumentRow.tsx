import { FC, useRef, useState, useCallback } from "react";
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Mail,
  FileSpreadsheet,
  Image,
  File,
  CheckCircle,
  Clock,
  XCircle,
  Users,
} from "lucide-react";
import { Button, Chip, AlertDialog, Checkbox } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

import { Document } from "@/types/document";
import {
  getStatusInfo,
  getFileExt,
  formatDate,
  getApprovalProgress,
} from "@/utils/document";

interface DocumentRowProps {
  file: Document;
  onView?: (file: Document) => void;
  onDownload?: (file: Document) => void;
  onDelete: (id: string | number) => void;
  onSendEmail?: (file: Document) => void;
  type?: "document" | "certificate";
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onSelect?: (id: string | number) => void;
}

function getFileIcon(filePath: string | null) {
  const ext = filePath?.split(".").pop()?.toLowerCase();

  if (ext === "pdf")
    return { icon: FileText, color: "text-danger", bg: "bg-danger/10" };
  if (["doc", "docx"].includes(ext || ""))
    return {
      icon: FileSpreadsheet,
      color: "text-primary",
      bg: "bg-primary/10",
    };
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || ""))
    return { icon: Image, color: "text-success", bg: "bg-success/10" };

  return { icon: File, color: "text-default-500", bg: "bg-default-100" };
}

function getStatusIcon(status: string) {
  const s = status?.toLowerCase();

  if (["final", "approved", "approve", "publish", "published"].includes(s))
    return CheckCircle;
  if (s === "rejected") return XCircle;

  return Clock;
}

export const DocumentRow: FC<DocumentRowProps> = ({
  file,
  onView,
  onDownload,
  onDelete,
  onSendEmail,
  type = "document",
  isSelected = false,
  isSelectionMode = false,
  onSelect,
}) => {
  const { isFinal, isRejected, label, color } = getStatusInfo(
    file.status,
    file.approverIds,
    file.approvedByIds,
    type,
  );
  const hasFile = !!(file.fileId || file.filePath);
  const ext = hasFile ? getFileExt(file.filePath!) : "NO FILE";
  const {
    icon: FileIcon,
    color: fileColor,
    bg: fileBg,
  } = getFileIcon(file.filePath);
  const StatusIcon = getStatusIcon(file.status);
  const { approvedCount, totalCount } = getApprovalProgress(
    file.approverIds,
    file.approvedByIds,
  );

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const preventClickRef = useRef(false);

  const handlePointerDown = useCallback(() => {
    if (isSelectionMode) return;
    preventClickRef.current = false;
    setIsLongPressing(true);
    longPressTimer.current = setTimeout(() => {
      onSelect?.(file.id);
      preventClickRef.current = true;
      setIsLongPressing(false);
    }, 700);
  }, [file.id, isSelectionMode, onSelect]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsLongPressing(false);
  }, []);

  const handleClick = useCallback(() => {
    if (preventClickRef.current) {
      preventClickRef.current = false;

      return;
    }
    if (isSelectionMode) onSelect?.(file.id);
  }, [file.id, isSelectionMode, onSelect]);

  const borderColor = isFinal
    ? "border-l-success"
    : isRejected
      ? "border-l-danger"
      : "border-l-warning";

  const chipColor = color;
  const statusColor = isFinal
    ? "text-success"
    : isRejected
      ? "text-danger"
      : "text-warning";

  return (
    <motion.div
      layout
      className={`relative flex flex-col rounded-xl border border-divider bg-content1 transition-all duration-200 select-none
        ${isHovered ? "shadow-lg -translate-y-0.5" : "shadow-sm"}
        ${isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}
        ${isLongPressing ? "scale-[0.98]" : ""}
        ${borderColor} border-l-[3px]
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerCancel={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerUp}
      onPointerUp={handlePointerUp}
    >
      {/* Main Content */}
      <div className="p-3 flex items-start gap-3 flex-1">
        <AnimatePresence>
          {isSelectionMode && (
            <motion.div
              animate={{ opacity: 1, scale: 1, width: "auto" }}
              className="flex items-center shrink-0 pt-1 overflow-hidden"
              exit={{ opacity: 0, scale: 0.5, width: 0 }}
              initial={{ opacity: 0, scale: 0.5, width: 0 }}
            >
              <Checkbox isReadOnly isSelected={isSelected}>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`w-10 h-10 shrink-0 rounded-xl ${fileBg} flex items-center justify-center shadow-sm`}
        >
          <FileIcon className={fileColor} size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-semibold truncate ${isSelected ? "text-primary" : "text-foreground"}`}
              >
                {file.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[10px] font-bold text-default-400 bg-default-100 dark:bg-default-50 px-1.5 py-0.5 rounded leading-none uppercase">
                  {ext}
                </span>
                <span className="text-[11px] text-default-400">
                  {formatDate(file.documentDate ?? file.createdAt)}
                </span>
                {file.sender && (
                  <span className="text-[11px] text-default-400 truncate max-w-[140px] hidden sm:inline">
                    {file.sender}
                  </span>
                )}
              </div>
            </div>

            <Chip
              className="font-bold border-none h-5 px-2 text-[9px] tracking-tighter shrink-0 gap-1"
              color={chipColor as any}
              size="sm"
              variant="soft"
            >
              <StatusIcon className={statusColor} size={10} />
              {label}
            </Chip>
          </div>

          {!isFinal && !isRejected && totalCount > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1 rounded-full bg-default-100 overflow-hidden max-w-[120px]">
                <motion.div
                  animate={{ width: `${(approvedCount / totalCount) * 100}%` }}
                  className="h-full rounded-full bg-warning"
                  initial={{ width: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-[9px] font-medium text-default-400 flex items-center gap-1">
                <Users size={10} />
                {approvedCount}/{totalCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Actions - always reserved, fade in on hover */}
      <div
        className={`transition-all duration-200 ${isHovered && !isSelectionMode ? "opacity-100 max-h-10" : "opacity-0 max-h-0"} overflow-hidden`}
      >
        <div className="h-px bg-divider mx-3" />
        <div className="flex items-center gap-1 px-3 py-2">
          {onView && (
            <Button
              className={`h-7 text-[10px] font-semibold gap-1 rounded-lg ${isFinal && hasFile ? "text-default-500 hover:text-primary" : "text-default-200 opacity-50 cursor-not-allowed"}`}
              isDisabled={!isFinal || !hasFile}
              size="sm"
              variant="ghost"
              onPress={() => isFinal && hasFile && onView(file)}
            >
              <Eye size={12} /> Preview
            </Button>
          )}
          {onDownload && (
            <Button
              className={`h-7 text-[10px] font-semibold gap-1 rounded-lg ${isFinal && hasFile ? "text-default-500 hover:text-success" : "text-default-200 opacity-50 cursor-not-allowed"}`}
              isDisabled={!isFinal || !hasFile}
              size="sm"
              variant="ghost"
              onPress={() => isFinal && hasFile && onDownload(file)}
            >
              <Download size={12} /> Download
            </Button>
          )}
          {onSendEmail && (
            <Button
              className={`h-7 text-[10px] font-semibold gap-1 rounded-lg ${isFinal ? "text-default-500 hover:text-violet-500" : "text-default-200 opacity-50 cursor-not-allowed"}`}
              isDisabled={!isFinal}
              size="sm"
              variant="ghost"
              onPress={() => isFinal && onSendEmail(file)}
            >
              <Mail size={12} /> Email
            </Button>
          )}
          <div className="flex-1" />
          <Button
            className="h-7 text-[10px] font-semibold gap-1 rounded-lg text-default-400 hover:text-danger"
            size="sm"
            variant="ghost"
            onPress={() => setDeleteOpen(true)}
          >
            <Trash2 size={12} /> Delete
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[400px]">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>Confirm Deletion</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p className="text-sm text-default-500">
                  Are you sure you want to permanently delete{" "}
                  <strong>{file.title}</strong>?
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary">
                  Cancel
                </Button>
                <Button
                  className="bg-danger text-white"
                  slot="close"
                  onClick={() => onDelete(file.id)}
                >
                  Confirm
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </motion.div>
  );
};
