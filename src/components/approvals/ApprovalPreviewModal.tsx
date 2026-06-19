import { FC, useEffect, useState, useRef } from "react";
import { Button, Spinner } from "@heroui/react";

import api from "@/lib/axios";

interface ApprovalPreviewModalProps {
  doc: any;
  isOpen: boolean;
  onClose: () => void;
}

const isPdfFile = (filePath: string): boolean =>
  filePath?.toUpperCase().endsWith(".PDF");
const isImageFile = (filePath: string | null): boolean =>
  /\.(png|jpe?g)$/i.test(filePath || "");
const getFileExt = (filePath: string | null): string =>
  filePath?.split(".").pop()?.toUpperCase() || "FILE";

const getPreviewEndpoint = (doc: any): string => {
  switch (doc.sourceType) {
    case "incoming":
      return `/surat-masuk/preview/${doc.id}`;
    case "outgoing":
      return `/surat-keluar/preview/${doc.id}`;
    case "certificate":
      return `/sertifikat/preview/${doc.id}`;
    default:
      return `/surat-masuk/preview/${doc.id}`;
  }
};

export const ApprovalPreviewModal: FC<ApprovalPreviewModalProps> = ({
  doc,
  isOpen,
  onClose,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<string>("");
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen || !doc) return;

    const loadPreview = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = getPreviewEndpoint(doc);
        const response = await api.get(endpoint, { responseType: "blob" });
        const blob = response.data;
        const url = URL.createObjectURL(blob);

        objectUrlRef.current = url;
        setPreviewUrl(url);

        const fileSize = (blob.size / 1024).toFixed(1);
        const ext = getFileExt(doc.filePath);

        setPageInfo(`${ext} · ${fileSize} KB`);
      } catch (err: any) {
        const msg = err?.response?.data?.error;

        setError(msg || "Failed to load preview");
      } finally {
        setLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPreviewUrl(null);
      setError(null);
      setPageInfo("");
    };
  }, [isOpen, doc?.id]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl overflow-hidden sm:rounded-2xl sm:max-h-[90vh] bg-content1 shadow-2xl h-full sm:h-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-divider px-4 py-3">
          <div className="min-w-0">
            <h3 className="truncate font-bold text-foreground">{doc.title}</h3>
            <p className="text-xs text-default-500">
              {pageInfo || `${getFileExt(doc.filePath)} preview`}
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto bg-black/5 p-4">
          {loading ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : error ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <p className="text-danger text-sm">{error}</p>
            </div>
          ) : previewUrl && isPdfFile(doc.filePath) ? (
            <div className="relative">
              <embed
                className="h-full min-h-[60vh] w-full rounded-lg bg-white"
                src={previewUrl}
                type="application/pdf"
              />
              <div className="pointer-events-none absolute bottom-4 right-4 select-none rotate-[-15deg] text-lg font-bold text-red-500/30">
                PREVIEW ONLY
              </div>
            </div>
          ) : previewUrl && isImageFile(doc.filePath) ? (
            <div className="relative">
              <img
                alt={doc.title}
                className="mx-auto max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
                src={previewUrl}
                onContextMenu={(e) => e.preventDefault()}
              />
              <div className="pointer-events-none absolute bottom-4 right-4 select-none rotate-[-15deg] text-lg font-bold text-red-500/30">
                PREVIEW ONLY
              </div>
            </div>
          ) : !loading && !error ? (
            <div className="flex min-h-[60vh] items-center justify-center text-center">
              <p className="text-sm font-medium text-default-600">
                Preview not available for this file type.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
