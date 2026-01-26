import api from '@/services/api';

export enum StaffType {
  MAID = "maid",
  DRIVER = "driver",
  COOK = "cook",
  GARDENER = "gardener",
  NANNY = "nanny",
  OTHER = "other"
}

export enum StaffStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLACKLISTED = "blacklisted"
}

export interface Staff {
  id: number;
  full_name: string;
  phone_number: string;
  staff_type: StaffType;
  status: StaffStatus;
  photo_url?: string;
  employer_id?: number;
  access_code?: string;
  created_at: string;
}

export interface StaffCreate {
  full_name: string;
  phone_number: string;
  staff_type: StaffType;
  photo_url?: string;
}

export interface StaffUpdate {
  full_name?: string;
  phone_number?: string;
  status?: StaffStatus;
  staff_type?: StaffType;
}

export interface StaffAttendance {
  id: number;
  staff_id: number;
  check_in_time: string;
  check_out_time?: string;
  status: string;
}

export const staffService = {
  async getMyStaff(): Promise<Staff[]> {
    const response = await api.get<Staff[]>('/staff/');
    return response.data;
  },

  async getStaffByAccessCode(code: string): Promise<Staff> {
    const response = await api.get<Staff>(`/staff/code/${code}`);
    return response.data;
  },

  async checkInStaff(staffId: number): Promise<StaffAttendance> {
    const response = await api.post<StaffAttendance>(`/staff/${staffId}/attendance`, {
      check_in_time: new Date().toISOString(),
      status: 'present'
    });
    return response.data;
  },

  async checkOutStaff(staffId: number): Promise<StaffAttendance> {
    const response = await api.post<StaffAttendance>(`/staff/${staffId}/attendance`, {
      check_out_time: new Date().toISOString(),
      status: 'left'
    });
    return response.data;
  },

  async getAttendance(staffId: number): Promise<StaffAttendance[]> {
    const response = await api.get<StaffAttendance[]>(`/staff/${staffId}/attendance`);
    return response.data;
  },

  async createStaff(data: StaffCreate): Promise<Staff> {
    const response = await api.post<Staff>('/staff/', data);
    return response.data;
  },

  async updateStaff(id: number, data: StaffUpdate): Promise<Staff> {
    const response = await api.patch<Staff>(`/staff/${id}`, data);
    return response.data;
  },

  async deleteStaff(id: number): Promise<void> {
    await api.delete(`/staff/${id}`);
  },

  async getAllAttendance(params?: { startDate?: string; endDate?: string }): Promise<StaffAttendance[]> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('start_date', params.startDate);
    if (params?.endDate) queryParams.append('end_date', params.endDate);
    
    const response = await api.get<StaffAttendance[]>(`/staff/attendance/all?${queryParams.toString()}`);
    return response.data;
  }
};
