import api from "@/lib/axios";
import { Document, DocumentStats } from "@/types/document";

export interface FetchDocumentsParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
}

export interface FetchDocumentsResponse {
  data: Document[];
  total: number;
  totalPages: number;
  stats: DocumentStats;
}

export const documentService = {
  fetchDocuments: async (
    endpoint: string,
    params: FetchDocumentsParams,
  ): Promise<FetchDocumentsResponse> => {
    const response = await api.get(endpoint, { params });
    const payload = response.data ?? {};

    return {
      data: Array.isArray(payload.data) ? payload.data : [],
      total: typeof payload.total === "number" ? payload.total : 0,
      totalPages:
        typeof payload.totalPages === "number" ? payload.totalPages : 1,
      stats: payload.stats || { total: 0, pending: 0, verified: 0 },
    };
  },

  uploadDocument: async (endpoint: string, formData: FormData) => {
    return api.post(endpoint, formData);
  },

  bulkUploadDocuments: async (endpoint: string, formData: FormData) => {
    return api.post(`${endpoint}/bulk`, formData);
  },

  deleteDocument: async (endpoint: string, id: string | number) => {
    return api.delete(`${endpoint}/${id}`);
  },

  downloadDocument: async (endpoint: string, id: string | number) => {
    return api.get(`${endpoint}/download/${id}`, { responseType: "blob" });
  }
};
