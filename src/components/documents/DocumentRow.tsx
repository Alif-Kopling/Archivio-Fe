import { FC, useRef, useState, useCallback } from "react";
import { FileText, Download, Eye, Trash2, Mail } from "lucide-react";
import {
  Button,
  Tooltip,
  Chip,
  ListBox,
  AlertDialog,
  Checkbox,
} from "@heroui/react";
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

  return (
    <ListBox.Item
      key={file.id}
      className={`py-0 px-0 border-b border-divider/10 rounded-none transition-colors duration-300 ${isSelected ? "bg-primary-50/50 dark:bg-primary-900/10" : ""}`}
      textValue={file.title}
    >
      {}
      <div
        className={`flex items-center justify-between w-full gap-3 px-3 py-2 select-none hover:bg-default-100/50 transition-all duration-200 cursor-pointer ${isLongPressing ? "scale-[0.98] bg-default-100" : ""}`}
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
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          {/* Checkbox Modular ala HeroUI v3 */}
          <AnimatePresence mode="popLayout">
            {isSelectionMode && (
              <motion.div
                animate={{
                  opacity: 1,
                  scale: 1,
                  width: "auto",
                  marginRight: "8px",
                }}
                className="flex items-center justify-center"
                exit={{ opacity: 0, scale: 0.5, width: 0, marginRight: 0 }}
                initial={{ opacity: 0, scale: 0.5, width: 0, marginRight: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Checkbox
                  isReadOnly
                  className="pointer-events-none"
                  isSelected={isSelected}
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                </Checkbox>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center border shadow-sm transition-all duration-300 ${
              isSelected
                ? "bg-primary/20 text-primary border-primary/20"
                : isPdf
                  ? "bg-danger/10 text-danger border-danger/10"
                  : type === "certificate"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-accent/10 text-accent border-accent/10"
            }`}
          >
            <FileText size={18} />
          </div>

          <div className="flex flex-col overflow-hidden">
            <span
              className={`text-[13px] font-bold truncate transition-colors ${isSelected ? "text-primary" : "text-foreground"}`}
            >
              {file.title}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {file.filePath && (
                <span className="text-[8px] text-default-500 font-black bg-default-100 px-1 py-0.5 rounded leading-none uppercase">
                  {getFileExt(file.filePath)}
                </span>
              )}
              <span className="text-[10px] text-default-400 font-medium">
                {formatDate(file.documentDate ?? file.createdAt)}
              </span>
              {file.sender && (
                <span className="text-[10px] text-default-400 font-medium hidden md:inline">
                  {file.sender}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <AnimatePresence>
            {!isSelectionMode && (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
                exit={{ opacity: 0, x: 20 }}
                initial={{ opacity: 0, x: 20 }}
              >
                <Chip
                  className="font-black border-none h-5 px-2 text-[9px] tracking-tighter hidden md:inline-flex"
                  color={color as any}
                  size="sm"
                  variant="soft"
                >
                  {label}
                </Chip>

                <div className="flex items-center gap-0.5">
                  {onView && (
                    <Tooltip delay={0}>
                      <Tooltip.Trigger>
                        <Button
                          isIconOnly
                          className={`rounded-md w-7 h-7 min-w-7 ${isFinal ? "text-default-400 hover:text-primary hover:bg-primary/5" : "text-default-200 cursor-not-allowed opacity-50"}`}
                          isDisabled={!isFinal}
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            isFinal && onView(file);
                          }}
                        >
                          <Eye size={14} />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>View</Tooltip.Content>
                    </Tooltip>
                  )}

                  {onDownload && (
                    <Tooltip delay={0}>
                      <Tooltip.Trigger>
                        <Button
                          isIconOnly
                          className={`rounded-md w-7 h-7 min-w-7 ${isFinal ? "text-default-400 hover:text-success hover:bg-success/5" : "text-default-200 cursor-not-allowed opacity-50"}`}
                          isDisabled={!isFinal}
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            isFinal && onDownload(file);
                          }}
                        >
                          <Download size={14} />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>Download</Tooltip.Content>
                    </Tooltip>
                  )}

                  {onSendEmail && (
                    <Tooltip delay={0}>
                      <Tooltip.Trigger>
                        <Button
                          isIconOnly
                          className={`rounded-md w-7 h-7 min-w-7 ${isFinal ? "text-default-400 hover:text-violet-500 hover:bg-violet-500/5" : "text-default-200 cursor-not-allowed opacity-50"}`}
                          isDisabled={!isFinal}
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            isFinal && onSendEmail(file);
                          }}
                        >
                          <Mail size={14} />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>Send via Email</Tooltip.Content>
                    </Tooltip>
                  )}

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
                      <Tooltip.Content>Delete</Tooltip.Content>
                    </Tooltip>
                    <AlertDialog.Backdrop>
                      <AlertDialog.Container>
                        <AlertDialog.Dialog className="sm:max-w-[400px]">
                          <AlertDialog.CloseTrigger />
                          <AlertDialog.Header>
                            <AlertDialog.Icon status="danger" />
                            <AlertDialog.Heading>
                              Confirm Deletion
                            </AlertDialog.Heading>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ListBox.Item>
  );
};
