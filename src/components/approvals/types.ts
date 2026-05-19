export interface ApprovalDocument {
  id: string | number;
  title: string;
  filePath?: string;
  status: string;
  createdAt: string;
  type: "masuk" | "keluar" | "sertifikat";
  sourceType: "incoming" | "outgoing" | "certificate";
}

export const getFileExt = (filePath?: string) => {
  if (!filePath) return "FILE";

  return filePath.split(".").pop()?.toUpperCase() || "FILE";
};

export const mapSourceType = (type: ApprovalDocument["type"]): ApprovalDocument["sourceType"] => {
  switch (type) {
    case "masuk":
      return "incoming";
    case "keluar":
      return "outgoing";
    case "sertifikat":
    default:
      return "certificate";
  }
};

export const getSourceLabel = (sourceType: ApprovalDocument["sourceType"]) => {
  switch (sourceType) {
    case "incoming":
      return "Incoming Mail";
    case "outgoing":
      return "Outgoing Mail";
    case "certificate":
      return "Certificate";
    default:
      return "Document";
  }
};

export const getSourceChipProps = (sourceType: ApprovalDocument["sourceType"]) => {
  switch (sourceType) {
    case "incoming":
      return {
        className:
          "bg-blue-500/10 text-blue-600 border border-blue-500/20 font-bold",
        variant: "soft" as const,
      };
    case "outgoing":
      return {
        className:
          "bg-violet-500/10 text-violet-600 border border-violet-500/20 font-bold",
        variant: "soft" as const,
      };
    case "certificate":
      return {
        className:
          "bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold",
        variant: "soft" as const,
      };
    default:
      return {
        className: "bg-default-100 text-default-600 border border-divider font-bold",
        variant: "soft" as const,
      };
  }
};
