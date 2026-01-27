import api from '@/services/api';

// Amenity Service
export enum AmenityStatus {
  AVAILABLE = 'available',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed'
}

export interface Amenity {
  id: number;
  name: string;
  description: string;
  capacity: number;
  status: AmenityStatus;
  open_hours?: string;
  image_url?: string;
  display_image_url?: string;
  requires_approval: boolean;
  created_at: string;
}

export interface AmenityCreate {
  name: string;
  description: string;
  capacity: number;
  status: string;
  open_hours?: string;
  image_url?: string;
  requires_approval: boolean;
}

export const amenityService = {
  getAmenities: async () => {
    const response = await api.get<Amenity[]>('/amenities/');
    return response.data;
  },

  getAmenity: async (id: number) => {
    const response = await api.get<Amenity>(`/amenities/${id}`);
    return response.data;
  },

  createAmenity: async (data: AmenityCreate) => {
    const response = await api.post<Amenity>('/amenities/', data);
    return response.data;
  },

  updateAmenity: async (id: number, data: Partial<AmenityCreate>) => {
    const response = await api.patch<Amenity>(`/amenities/${id}`, data);
    return response.data;
  },

  deleteAmenity: async (id: number) => {
    const response = await api.delete<Amenity>(`/amenities/${id}`);
    return response.data;
  }
};
