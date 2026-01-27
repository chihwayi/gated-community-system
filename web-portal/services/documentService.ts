import api from './api';

export enum DocumentCategory {
  BYLAWS = 'bylaws',
  MINUTES = 'minutes',
  FORM = 'form',
  OTHER = 'other'
}

export interface CommunityDocument {
  id: number;
  title: string;
  description?: string;
  category: DocumentCategory;
  file_url: string;
  created_at: string;
  uploaded_by_id: number;
}

export interface DocumentCreate {
  title: string;
  description?: string;
  category: DocumentCategory;
  file_url: string;
}

export const documentService = {
  getDocuments: (category?: DocumentCategory) => api.get<CommunityDocument[]>(`/documents/${category ? `?category=${category}` : ''}`),
  
  createDocument: (data: DocumentCreate) => api.post<CommunityDocument>('/documents/', data),
  
  deleteDocument: (id: number) => api.delete<CommunityDocument>(`/documents/${id}`),

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // Assuming backend returns { url: "..." }
    return api.post<{url: string}>('/upload/', formData);
  }
};
