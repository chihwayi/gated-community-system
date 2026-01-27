import api from './api';

export const fileService = {
    upload: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        
        // api.post automatically handles Content-Type for FormData
        const response = await api.post<{ url: string }>('/utils/upload', formData);
        return response.data.url;
    }
};
