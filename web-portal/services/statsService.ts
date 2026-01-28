import api from './api';

export interface DashboardStats {
  visitors: {
    total: number;
    active: number;
    pending: number;
  };
  incidents: {
    open: number;
  };
  financial: {
    pending_bills: number;
  };
  maintenance: {
    open_tickets: number;
  };
}

export const statsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/stats/dashboard');
    return response.data;
  },
};
