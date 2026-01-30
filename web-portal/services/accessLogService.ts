import api from './api';

export interface AccessLog {
  id: number;
  user_id: number;
  direction: 'entry' | 'exit';
  method: string;
  timestamp: string;
  guard_id?: number;
}

export interface CreateAccessLogData {
  user_id: number;
  direction: 'entry' | 'exit';
  method?: string;
}

export const accessLogService = {
  createAccessLog: async (data: CreateAccessLogData): Promise<AccessLog> => {
    const response = await api.post<AccessLog>('/access-logs/', data);
    return response.data;
  },

  getUserAccessLogs: async (userId: number): Promise<AccessLog[]> => {
    const response = await api.get<AccessLog[]>(`/access-logs/user/${userId}`);
    return response.data;
  }
};
