import api from './api';

export const fileService = {
    upload: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Use the Minio upload endpoint
        const response = await api.post<{ url: string }>('/upload/', formData);
        return response.data.url;
    }
};
