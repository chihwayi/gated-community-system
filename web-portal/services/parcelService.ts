import api from './api';

export enum ParcelStatus {
  AT_GATE = 'at_gate',
  COLLECTED = 'collected',
  RETURNED = 'returned'
}

export interface Parcel {
  id: number;
  recipient_id: number;
  carrier?: string;
  status: ParcelStatus;
  pickup_code?: string;
  image_url?: string;
  display_image_url?: string;
  notes?: string;
  created_at: string;
  collected_at?: string;
}

export interface ParcelCreate {
  recipient_id: number;
  carrier?: string;
  notes?: string;
  image_url?: string;
}

export const parcelService = {
  getMyParcels: () => api.get<Parcel[]>('/parcels/'),
  getAllParcels: (status?: ParcelStatus) => api.get<Parcel[]>(`/parcels/${status ? `?status=${status}` : ''}`),
  createParcel: (data: ParcelCreate) => api.post<Parcel>('/parcels/', data),
  markCollected: (id: number) => api.put<Parcel>(`/parcels/${id}/collect`, {})
};
