/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useNotify } from "@/context/NotificationContext";
import { documentService } from "@/services/document.service";
import { useDebounce } from "@/hooks/useDebounce";
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
  initialSortBy = "documentDate",
}: UseDocumentManagementOptions) {
  const queryClient = useQueryClient();
  const notify = useNotify();

  // --- Local UI State ---
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const limit = 9;

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<UploadMode>("single");
  const [uploadForm, setUploadForm] = useState<DocumentUploadFormState>({
    title: "",
    documentDate: getTodayDateString(),
    sender: "",
    file: null,
    approverIds: [],
  });
  const [bulkFiles, setBulkFiles] = useState<BulkFileItem[]>([]);
  
  const [previewFile, setPreviewFile] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());

  // --- Data Fetching (TanStack Query) ---
  const queryKey = useMemo(
    () => [endpoint, "list", { debouncedSearch, page, sortBy, sortOrder, statusFilter }],
    [endpoint, debouncedSearch, page, sortBy, sortOrder, statusFilter]
  );

  const { data, isLoading: queryLoading, isFetching: searchLoading, refetch } = useQuery({
    queryKey,
    queryFn: () => documentService.fetchDocuments(endpoint, {
      search: debouncedSearch,
      page,
      limit,
      sortBy,
      sortOrder,
      status: statusFilter,
    }),
    placeholderData: (previousData) => previousData,
  });

  const files = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const stats: DocumentStats = resolveStats(
    data?.stats ?? { total: 0, pending: 0, verified: 0 },
    files
  );

  // --- Mutations ---
  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => documentService.uploadDocument(endpoint, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setUploadOpen(false);
      notify({
        title: "Document Uploaded",
        description: "Your document has been submitted and is pending administrator approval.",
        status: "success",
      });
    },
    onError: (error: any) => {
      notify({
        title: "Upload Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: (formData: FormData) => documentService.bulkUploadDocuments(endpoint, formData),
    onSuccess: (res, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setBulkFiles([]);
      setUploadOpen(false);
      notify({
        title: "Bulk Upload Success",
        description: "Documents have been submitted and are pending administrator approval.",
        status: "success",
      });
    },
    onError: (error: any) => {
      notify({
        title: "Bulk Upload Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => documentService.deleteDocument(endpoint, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      notify({
        title: "Success",
        description: "Document deleted successfully.",
        status: "success",
      });
    },
    onError: (error: any) => {
      notify({
        title: "Delete Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
    },
  });

  // --- Handlers ---
  const isSelectionMode = selectedIds.size > 0;

  const toggleSelection = useCallback((id: number | string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) window.URL.revokeObjectURL(previewUrl);
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
    if (uploadMutation.isPending || bulkUploadMutation.isPending) return;
    setUploadOpen(false);
  };

  const handleUploadFieldChange = (
    field: keyof Omit<DocumentUploadFormState, "file">,
    value: string | string[],
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

    const formData = new FormData();
    formData.append("file", uploadForm.file);
    formData.append("title", uploadForm.title.trim());
    formData.append("documentDate", uploadForm.documentDate);
    formData.append("sender", uploadForm.sender.trim());
    formData.append("status", "draft");
    formData.append("approverIds", JSON.stringify(uploadForm.approverIds || []));

    uploadMutation.mutate(formData);
  };

  const handleDelete = (id: string | number) => {
    deleteMutation.mutate(id);
  };

  const handleDownload = async (file: Document) => {
    try {
      const response = await documentService.downloadDocument(endpoint, file.id);
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
    if (previewUrl) window.URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setPreviewFile(null);
    setPreviewLoading(false);
  };

  const handleView = async (file: Document) => {
    try {
      setPreviewFile(file);
      setPreviewLoading(true);
      const response = await documentService.downloadDocument(endpoint, file.id);
      const contentType = String(response.headers?.["content-type"] || "application/octet-stream");
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
    const today = getTodayDateString();
    const newItems: BulkFileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = stripFileExtension(file.name);
      newItems.push({
        id: `${Date.now()}-${i}`,
        file,
        title,
        sender: "",
        documentDate: today,
        isValid: false,
      });
    }
    setBulkFiles((current) => [...current, ...newItems]);
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

  const handleBulkSubmit = async () => {
    const formData = new FormData();
    bulkFiles.forEach((item, index) => {
      formData.append("files", item.file);
      formData.append(`title_${index}`, item.title);
      formData.append(`sender_${index}`, item.sender);
      formData.append(`documentDate_${index}`, item.documentDate);
    });
    formData.append("approverIds", JSON.stringify(uploadForm.approverIds || []));

    bulkUploadMutation.mutate(formData);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    // For bulk delete, we might want a specialized endpoint if available,
    // but here we follow the original logic of individual deletes.
    try {
      const idsToDelete = Array.from(selectedIds);
      await Promise.all(idsToDelete.map(id => documentService.deleteDocument(endpoint, id)));
      
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      notify({
        title: "Bulk Delete Success",
        description: `${selectedIds.size} documents deleted successfully.`,
        status: "success",
      });
      clearSelection();
    } catch (error: any) {
      notify({
        title: "Bulk Delete Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
    }
  };

  return {
    files,
    loading: queryLoading || uploadMutation.isPending || bulkUploadMutation.isPending,
    searchLoading,
    previewFile,
    previewUrl,
    previewLoading,
    stats,
    searchQuery,
    setSearchQuery: handleSearchChange,
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
    fetchDocuments: refetch, // compatibility mapping
    selectedIds,
    isSelectionMode,
    toggleSelection,
    clearSelection,
    handleBulkDelete,
  };
}
