import api from '@/services/api';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export interface Booking {
  id: number;
  user_id: number;
  amenity_id: number;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes?: string;
  created_at: string;
}

export interface BookingCreate {
  amenity_id: number;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface BookingUpdate {
  status?: BookingStatus;
  notes?: string;
}

export const bookingService = {
  getBookings: async (params?: { startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('start_date', params.startDate);
    if (params?.endDate) queryParams.append('end_date', params.endDate);
    
    const response = await api.get<Booking[]>(`/bookings/?${queryParams.toString()}`);
    return response.data;
  },

  createBooking: async (data: BookingCreate) => {
    const response = await api.post<Booking>('/bookings/', data);
    return response.data;
  },

  updateBooking: async (id: number, status: string) => {
    const response = await api.patch<Booking>(`/bookings/${id}`, { status });
    return response.data;
  },

  cancelBooking: async (id: number) => {
    const response = await api.patch<Booking>(`/bookings/${id}`, { status: BookingStatus.CANCELLED });
    return response.data;
  }
};
