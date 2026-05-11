/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { FC } from "react";
import { Button, Spinner } from "@heroui/react";

interface PreviewDialogProps {
  file: any;
  onClose: () => void;
  onDownload: (file: any) => void;
  previewUrl: string;
  previewLoading: boolean;
}

const isPdfFile = (filePath: string): boolean =>
  filePath?.toUpperCase().endsWith(".PDF");
const isImageFile = (filePath: string): boolean =>
  /\.(png|jpe?g)$/i.test(filePath || "");
const getFileExt = (filePath: string): string =>
  filePath?.split(".").pop()?.toUpperCase() || "FILE";

export const DocumentPreviewDialog: FC<PreviewDialogProps> = ({
  file,
  onClose,
  onDownload,
  previewUrl,
  previewLoading,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    role="presentation"
    tabIndex={-1}
    onClick={onClose}
    onKeyDown={(e) => {
      if (e.key === "Escape") onClose();
    }}
  >
    <div
      className="w-full max-w-5xl overflow-hidden rounded-2xl bg-content1 shadow-2xl"
      role="document"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-divider px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate font-bold text-foreground">{file.title}</h3>
          <p className="text-xs text-default-500">
            {getFileExt(file.filePath)} preview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="font-semibold"
            size="sm"
            variant="primary"
            onClick={() => onDownload(file)}
          >
            Download
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
      <div className="min-h-[60vh] bg-black/5 p-4">
        {previewLoading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : isImageFile(file.filePath) ? (
          <img
            alt={file.title}
            className="mx-auto max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
            src={previewUrl}
          />
        ) : isPdfFile(file.filePath) ? (
          <iframe
            className="h-[70vh] w-full rounded-lg bg-white"
            src={previewUrl}
            title={file.title}
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
              onClick={() => onDownload(file)}
            >
              Download instead
            </Button>
          </div>
        )}
      </div>
    </div>
  </div>
);
