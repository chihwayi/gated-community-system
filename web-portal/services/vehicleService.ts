import api from './api';

export interface Vehicle {
  id: number;
  user_id: number;
  license_plate: string;
  make?: string;
  model?: string;
  color?: string;
  parking_slot?: string;
  image_url?: string;
  display_image_url?: string;
}

export interface VehicleCreate {
  license_plate: string;
  make?: string;
  model?: string;
  color?: string;
  parking_slot?: string;
  image_url?: string;
}

export const vehicleService = {
  getVehicles: () => api.get<Vehicle[]>('/vehicles/'),
  createVehicle: (data: VehicleCreate) => api.post<Vehicle>('/vehicles/', data),
  deleteVehicle: (id: number) => api.delete<Vehicle>(`/vehicles/${id}`)
};
