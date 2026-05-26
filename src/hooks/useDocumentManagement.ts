/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback, useEffect } from "react";

import { useNotify } from "@/context/NotificationContext";
import { documentService } from "@/services/document.service";
import {
  Document,
  DocumentStats,
  DocumentUploadFormState,
  BulkFileItem,
  UploadMode,
} from "@/types/document";
import {
  resolveStats,
  getTodayDateString,
  getDownloadFileName,
  stripFileExtension,
} from "@/utils/document";

interface UseDocumentManagementOptions {
  endpoint: string;
  initialSortBy?: string;
}

export function useDocumentManagement({
  endpoint,
  initialSortBy = "createdAt",
}: UseDocumentManagementOptions) {
  const [files, setFiles] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    pending: 0,
    verified: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState<DocumentUploadFormState>({
    title: "",
    documentDate: getTodayDateString(),
    sender: "",
    file: null,
    approverIds: [],
  });
  const [bulkFiles, setBulkFiles] = useState<BulkFileItem[]>([]);
  const [uploadMode, setUploadMode] = useState<UploadMode>("single");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const notify = useNotify();

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const result = await documentService.fetchDocuments(endpoint, {
        search: searchQuery,
        page,
        limit,
        sortBy,
        sortOrder,
        status: statusFilter,
      });

      setFiles(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setStats(resolveStats(result.stats, result.data));
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [endpoint, searchQuery, page, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    setSearchLoading(true);
    const timer = setTimeout(fetchDocuments, 500);

    return () => clearTimeout(timer);
  }, [fetchDocuments]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const openUploadDialog = () => {
    setUploadForm({
      title: "",
      documentDate: getTodayDateString(),
      sender: "",
      file: null,
      approverIds: [],
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
      if (uploadForm.approverIds && uploadForm.approverIds.length > 0) {
        formData.append("approverIds", JSON.stringify(uploadForm.approverIds));
      }

      await documentService.uploadDocument(endpoint, formData);
      setUploadOpen(false);
      notify({
        title: "Document Uploaded",
        description:
          "Your document has been submitted and is pending administrator approval.",
        status: "success",
      });
      fetchDocuments();
    } catch (error: any) {
      notify({
        title: "Upload Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await documentService.deleteDocument(endpoint, id);
      fetchDocuments();
      notify({
        title: "Success",
        description: "Document deleted successfully.",
        status: "success",
      });
    } catch (error: any) {
      notify({
        title: "Delete Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
    }
  };

  const handleDownload = async (file: Document) => {
    try {
      const response = await documentService.downloadDocument(
        endpoint,
        file.id,
      );
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

  const handleView = async (file: Document) => {
    try {
      setPreviewFile(file);
      setPreviewLoading(true);
      const response = await documentService.downloadDocument(
        endpoint,
        file.id,
      );
      const contentType = String(
        response.headers?.["content-type"] || "application/octet-stream",
      );
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      setPreviewUrl((current) => {
        if (current) window.URL.revokeObjectURL(current);

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

  const handleBulkFileChange = (files: FileList | null) => {
    if (!files) return;
    const newFiles: BulkFileItem[] = [];
    const today = getTodayDateString();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = stripFileExtension(file.name);

      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        title,
        sender: "",
        documentDate: today,
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

      await documentService.bulkUploadDocuments(endpoint, formData);
      notify({
        title: "Bulk Upload Success",
        description: `${bulkFiles.length} documents have been submitted and are pending administrator approval.`,
        status: "success",
      });
      setBulkFiles([]);
      setUploadOpen(false);
      fetchDocuments();
    } catch (error: any) {
      notify({
        title: "Bulk Upload Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    files,
    loading,
    searchLoading,
    previewFile,
    previewUrl,
    previewLoading,
    stats,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    uploadOpen,
    setUploadOpen,
    uploadForm,
    setUploadForm,
    bulkFiles,
    setBulkFiles,
    uploadMode,
    setUploadMode,
    page,
    setPage,
    totalPages,
    total,
    openUploadDialog,
    closeUploadDialog,
    handleUploadFieldChange,
    handleUploadFileChange,
    handleSubmitUpload,
    handleDelete,
    handleDownload,
    handleView,
    handleClosePreview,
    handleBulkFileChange,
    handleBulkItemChange,
    handleBulkItemRemove,
    handleBulkSubmit,
    fetchDocuments,
  };
}
