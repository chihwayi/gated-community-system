import api from './api';

export interface Notice {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  author_id: number;
  tenant_id: number;
  expiry_date?: string;
}

export interface NoticeCreate {
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  expiry_date?: string;
}

export const noticeService = {
  getNotices: async (): Promise<Notice[]> => {
    const response = await api.get<Notice[]>('/notices/');
    return response.data;
  },

  createNotice: async (data: NoticeCreate): Promise<Notice> => {
    const response = await api.post<Notice>('/notices/', data);
    return response.data;
  },
};
