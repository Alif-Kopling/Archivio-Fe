import { Document, DocumentStats } from "@/types/document";

export function computeStats(data: Document[]): DocumentStats {
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

export function resolveStats(
  payloadStats: Partial<DocumentStats> | undefined,
  data: Document[],
): DocumentStats {
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

export function stripFileExtension(fileName: string): string {
  const baseName = fileName.split(/[\\/]/).pop() || fileName;
  const lastDotIndex = baseName.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return baseName;
  }

  return baseName.slice(0, lastDotIndex);
}

export function getDownloadFileName(file: Document): string {
  const originalName = file.filePath?.split(/[\\/]/).pop();

  if (originalName && originalName.includes(".")) {
    return originalName.replace(/^\d{13}-/, "");
  }

  return file.title || "document.pdf";
}

export function hasFile(file: Document): boolean {
  return !!(file.fileId || file.filePath);
}

export function getApprovalProgress(
  approverIds?: string | null,
  approvedByIds?: string | null,
): { approvedCount: number; totalCount: number } {
  const ids: string[] = approverIds ? JSON.parse(approverIds) : [];
  const approved: string[] = approvedByIds ? JSON.parse(approvedByIds) : [];

  return {
    approvedCount: approved.length,
    totalCount: ids.length,
  };
}

export function getStatusInfo(
  status: string,
  approverIds?: string | null,
  approvedByIds?: string | null,
  type?: string,
) {
  const normalizedStatus = status?.toLowerCase();
  const isFinal = [
    "final",
    "approved",
    "approve",
    "publish",
    "published",
  ].includes(normalizedStatus);
  const isRejected = normalizedStatus === "rejected";

  if (isFinal) {
    return {
      isFinal: true,
      isRejected: false,
      label: "VERIFIED",
      color: "success" as const,
    };
  }

  if (isRejected) {
    return {
      isFinal: false,
      isRejected: true,
      label: "REJECTED",
      color: "danger" as const,
    };
  }

  if (type === "certificate") {
    return {
      isFinal: false,
      isRejected: false,
      label: "PENDING",
      color: "warning" as const,
    };
  }

  const { approvedCount, totalCount } = getApprovalProgress(
    approverIds,
    approvedByIds,
  );

  if (totalCount === 0) {
    return {
      isFinal: false,
      isRejected: false,
      label: "PENDING",
      color: "warning" as const,
    };
  }

  return {
    isFinal: false,
    isRejected: false,
    label: `PENDING ${approvedCount}/${totalCount}`,
    color: "warning" as const,
  };
}

export function getFileExt(filePath: string): string {
  return filePath?.split(".").pop()?.toUpperCase() || "FILE";
}

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDate(iso: string): string {
  if (!iso) return "-";

  return new Date(iso).toLocaleDateString("en-US");
}
