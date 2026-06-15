export interface Document {
  id: string | number;
  title: string;
  sender?: string | null;
  documentDate?: string | null;
  filePath: string | null;
  fileId?: string | null;
  type: string;
  status: string;
  createdAt: string;
  recipient?: string;
  size?: string;
  approverIds?: string;
  approvedByIds?: string;
}

export interface DocumentStats {
  total: number;
  pending: number;
  verified: number;
}

export interface DocumentUploadFormState {
  title: string;
  documentDate: string;
  sender: string;
  file: File | null;
  approverIds?: string[];
}

export interface BulkFileItem {
  id: string;
  file: File;
  title: string;
  sender: string;
  documentDate: string;
  isValid: boolean;
}

export type UploadMode = "single" | "bulk";
