/* eslint-disable prettier/prettier */
/* eslint-disable import/order */
/* eslint-disable react/jsx-sort-props */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { FC, useEffect, useState, useRef, useCallback } from "react";
import { SidebarUploadPanel } from "@/components/dashboard/SidebarUploadPanel";
import { Award, Clock, CheckCircle2 } from "lucide-react";
import {
  Card,
} from "@heroui/react";

import api from "@/lib/axios";
import { DocumentPreviewDialog } from "@/components/documents/DocumentPreviewDialog";
import { useNotify } from "@/context/NotificationContext";
import {
  ArchiveStats,
  type StatConfigItem,
} from "@/components/archives";

// types

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

// constants

const ACCEPTED_FORMATS = ".pdf,.jpg,.jpeg,.png";

const STAT_CONFIG: readonly StatConfigItem[] = [
  {
    key: "total",
    label: "Total Certificates",
    Icon: Award,
    color: "text-amber-500",
    bg: "bg-amber-900/10",
  },
  {
    key: "pending",
    label: "Pending / Draft",
    Icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-900/10",
  },
  {
    key: "verified",
    label: "Verified / Final",
    Icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
] as const;

// helpers

function computeStats(data: Sertifikat[]): Stats {
  return {
    total: data.length,
    pending: data.filter((s) => {
        const normalizedStatus = s.status?.toLowerCase();
        return (
            normalizedStatus === "pending" ||
            normalizedStatus === "draft" ||
            normalizedStatus === "submitted" ||
            normalizedStatus === "review" ||
            normalizedStatus === "waiting"
        );
    }).length,
    verified: data.filter((s) => {
        const normalizedStatus = s.status?.toLowerCase();
        return (
            normalizedStatus === "final" ||
            normalizedStatus === "approved" ||
            normalizedStatus === "approve" ||
            normalizedStatus === "publish" ||
            normalizedStatus === "published"
        );
    }).length,
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

function getDownloadFileName(file: Sertifikat): string {
  const originalName = file.filePath?.split(/[\\/]/).pop();

  if (originalName && originalName.includes(".")) {
    return originalName.replace(/^\d{13}-/, "");
  }

  return file.title || "certificate.pdf";
}

import { DocumentRow } from "@/components/documents/DocumentRow";
import { StorageIndicator } from "@/components/dashboard/StorageIndicator";
import { DocumentList } from "@/components/documents/DocumentList";

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [issuer, setIssuer] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const notify = useNotify();

  const fetchSertifikat = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/sertifikat", {
        params: {
          search: searchQuery,
          page,
          limit,
          sortBy,
          sortOrder,
          status: statusFilter,
        },
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
  }, [searchQuery, page, sortBy, sortOrder, statusFilter]);

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
      notify({
        title: "Certificate Uploaded",
        description:
          "Your document has been submitted and is pending administrator approval.",
        status: "success",
      });
      setIssuer("");
      fetchSertifikat();
    } catch (error: any) {
      notify({
        title: "Upload Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
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
      notify({
        title: "Delete Failed",
        description: error.response?.data?.error ?? error.message,
        status: "danger",
      });
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
      notify({
        title: "Download Failed",
        description: "Failed to download certificate.",
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
      notify({
        title: "Preview Failed",
        description: "Failed to preview certificate.",
        status: "danger",
      });
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
      <ArchiveStats configs={STAT_CONFIG} stats={stats as any} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch w-full flex-1 min-h-0">
        <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-4">
          <SidebarUploadPanel
            acceptedFormats="PDF, JPG, PNG"
            badgeColor="bg-amber-900/10 text-amber-500"
            buttonColor="bg-[#d97706] text-white hover:bg-[#b45309]"
            buttonShadow="shadow-warning/20"
            description="Manage digital certificates."
            icon={<Award size={22} />}
            loading={loading}
            title="Certificates"
            onUploadClick={handleUploadClick}
          />
          <Card className="border-none bg-content1 shadow-sm">
            <Card.Content className="px-4 py-3">
              <StorageIndicator
                count={stats.total}
                label="Storage Usage"
                showGb={true}
                total={100}
                // @ts-ignore - custom color prop
                className="[&_.bg-primary]:bg-warning"
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
            sortBy={sortBy}
            sortOrder={sortOrder}
            statusFilter={statusFilter}
            total={total}
            totalPages={totalPages}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onPageChange={setPage}
            onSearchChange={setSearchQuery}
            onSortByChange={(v) => {
              setSortBy(v);
              setPage(1);
            }}
            onSortOrderChange={() => {
              setSortOrder((p) => (p === "desc" ? "asc" : "desc"));
              setPage(1);
            }}
            onStatusFilterChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            onView={handleView}
            renderRow={(file) => (
              <DocumentRow
                key={file.id}
                file={file}
                type="certificate"
                onDelete={handleDelete}
                onDownload={handleDownload}
                onView={handleView}
              />
            )}
          />
        </div>
      </div>
      {previewFile ? (
        <DocumentPreviewDialog
          file={previewFile}
          onClose={handleClosePreview}
          onDownload={handleDownload}
          previewUrl={previewUrl}
          previewLoading={previewLoading}
        />
      ) : null}
    </div>
  );
} 