import { FC, useRef, useState, useCallback } from "react";
import { FileText, Download, Eye, Trash2, Mail } from "lucide-react";
import { Button, Chip, AlertDialog, Checkbox } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

import { Document } from "@/types/document";
import { getStatusInfo, getFileExt, formatDate } from "@/utils/document";

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
  const { isFinal, label, color } = getStatusInfo(
    file.status,
    file.approverIds,
    file.approvedByIds,
  );
  const isPdf = file.filePath?.toUpperCase().endsWith(".PDF");

  const [deleteOpen, setDeleteOpen] = useState(false);

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
    if (isSelectionMode) {
      onSelect?.(file.id);
    }
  }, [file.id, isSelectionMode, onSelect]);

  const iconBg = isSelected
    ? "bg-primary/20 text-primary border-primary/20"
    : isPdf
      ? "bg-danger/10 text-danger border-danger/10"
      : type === "certificate"
        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
        : "bg-accent/10 text-accent border-accent/10";

  return (
    <div
      className={`flex items-center justify-between w-full gap-2 select-none cursor-pointer transition-all duration-200 ${isLongPressing ? "scale-[0.99]" : ""}`}
      role="button"
      tabIndex={-1}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      onPointerCancel={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerUp}
      onPointerUp={handlePointerUp}
    >
      <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
        <AnimatePresence mode="popLayout">
          {isSelectionMode && (
            <motion.div
              animate={{ opacity: 1, scale: 1, width: "auto", marginRight: 0 }}
              className="flex items-center justify-center shrink-0"
              exit={{ opacity: 0, scale: 0.5, width: 0, marginRight: 0 }}
              initial={{ opacity: 0, scale: 0.5, width: 0, marginRight: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
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
          className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300 ${iconBg}`}
        >
          <FileText size={16} />
        </div>

        <div className="flex flex-col overflow-hidden min-w-0">
          <span
            className={`text-sm font-semibold truncate transition-colors ${isSelected ? "text-primary" : "text-foreground"}`}
          >
            {file.title}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {file.filePath && (
              <span className="text-[9px] text-default-500 font-bold bg-default-100 dark:bg-default-50 px-1 py-0.5 rounded leading-none uppercase">
                {getFileExt(file.filePath)}
              </span>
            )}
            <span className="text-[11px] text-default-400 font-medium">
              {formatDate(file.documentDate ?? file.createdAt)}
            </span>
            {file.sender && (
              <span className="text-[11px] text-default-400 font-medium truncate max-w-[120px] hidden sm:inline">
                {file.sender}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <AnimatePresence>
          {!isSelectionMode && (
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
              exit={{ opacity: 0, x: 20 }}
              initial={{ opacity: 0, x: 20 }}
            >
              <Chip
                className="font-bold border-none h-5 px-2 text-[9px] tracking-tighter hidden md:inline-flex"
                color={color as any}
                size="sm"
                variant="soft"
              >
                {label}
              </Chip>

              <div className="flex items-center gap-0.5">
                {onView && (
                  <Button
                    isIconOnly
                    className={`rounded-lg w-7 h-7 min-w-7 ${isFinal ? "text-default-400 hover:text-primary hover:bg-primary/5" : "text-default-200 opacity-50 cursor-not-allowed"}`}
                    isDisabled={!isFinal}
                    size="sm"
                    variant="ghost"
                    onPress={() => isFinal && onView(file)}
                  >
                    <Eye size={14} />
                  </Button>
                )}

                {onDownload && (
                  <Button
                    isIconOnly
                    className={`rounded-lg w-7 h-7 min-w-7 ${isFinal ? "text-default-400 hover:text-success hover:bg-success/5" : "text-default-200 opacity-50 cursor-not-allowed"}`}
                    isDisabled={!isFinal}
                    size="sm"
                    variant="ghost"
                    onPress={() => isFinal && onDownload(file)}
                  >
                    <Download size={14} />
                  </Button>
                )}

                {onSendEmail && (
                  <Button
                    isIconOnly
                    className={`rounded-lg w-7 h-7 min-w-7 ${isFinal ? "text-default-400 hover:text-violet-500 hover:bg-violet-500/5" : "text-default-200 opacity-50 cursor-not-allowed"}`}
                    isDisabled={!isFinal}
                    size="sm"
                    variant="ghost"
                    onPress={() => isFinal && onSendEmail(file)}
                  >
                    <Mail size={14} />
                  </Button>
                )}

                <Button
                  isIconOnly
                  className="rounded-lg w-7 h-7 min-w-7 text-default-400 hover:text-danger hover:bg-danger/5"
                  size="sm"
                  variant="ghost"
                  onPress={() => setDeleteOpen(true)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
    </div>
  );
};
