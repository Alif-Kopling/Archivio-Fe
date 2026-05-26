import { FC } from "react";
import { FileText, Download, Eye, Trash2, Mail } from "lucide-react";
import { Button, Tooltip, Chip, ListBox, AlertDialog } from "@heroui/react";

import { Document } from "@/types/document";
import { getStatusInfo, getFileExt, formatDate } from "@/utils/document";

interface DocumentRowProps {
  file: Document;
  onView?: (file: Document) => void;
  onDownload?: (file: Document) => void;
  onDelete: (id: string | number) => void;
  onSendEmail?: (file: Document) => void;
  type?: "document" | "certificate";
}

export const DocumentRow: FC<DocumentRowProps> = ({
  file,
  onView,
  onDownload,
  onDelete,
  onSendEmail,
  type = "document",
}) => {
  const { isFinal, label, color } = getStatusInfo(file.status, file.approverIds, file.approvedByIds);
  const isPdf = file.filePath?.toUpperCase().endsWith(".PDF");

  return (
    <ListBox.Item
      key={file.id}
      className="py-2 px-3 border-b border-divider/10 hover:bg-default-100/50 rounded-none first:rounded-t-lg last:rounded-b-lg last:border-none transition-colors"
      textValue={file.title}
    >
      <div className="flex items-center justify-between w-full gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center border shadow-sm ${
              isPdf
                ? "bg-danger/10 text-danger border-danger/10"
                : type === "certificate"
                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  : "bg-accent/10 text-accent border-accent/10"
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
              {file.sender && (
                <span className="text-[10px] text-default-400 font-medium">
                  {file.sender}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Chip
            className="font-black border-none h-5 px-2 text-[9px] tracking-tighter"
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
                    onClick={() => isFinal && onView(file)}
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
                    onClick={() => isFinal && onDownload(file)}
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
                    onClick={() => isFinal && onSendEmail(file)}
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
        </div>
      </div>
    </ListBox.Item>
  );
};
