import api from './api';

export interface UploadResponse {
  filename: string;
  object_key: string;
  url: string;
}

export const uploadService = {
  uploadFile: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/upload/', formData);
    return response.data;
  }
};
