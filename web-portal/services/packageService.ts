import api from './api';

export interface Package {
    id: number;
    name: string;
    description?: string;
    price: number;
    max_admins: number;
    max_guards: number;
    max_residents: number;
    is_active: boolean;
    created_at?: string;
}

export interface PackageCreate {
    name: string;
    description?: string;
    price?: number;
    max_admins?: number;
    max_guards?: number;
    max_residents?: number;
    is_active?: boolean;
}

export interface PackageUpdate {
    name?: string;
    description?: string;
    price?: number;
    max_admins?: number;
    max_guards?: number;
    max_residents?: number;
    is_active?: boolean;
}

export const packageService = {
    getAllPackages: async (skip = 0, limit = 100): Promise<Package[]> => {
        const response = await api.get<Package[]>(`/packages/?skip=${skip}&limit=${limit}`);
        return response.data;
    },

    createPackage: async (data: PackageCreate): Promise<Package> => {
        const response = await api.post<Package>('/packages/', data);
        return response.data;
    },

    updatePackage: async (id: number, data: PackageUpdate): Promise<Package> => {
        const response = await api.put<Package>(`/packages/${id}`, data);
        return response.data;
    },

    deletePackage: async (id: number): Promise<Package> => {
        const response = await api.delete<Package>(`/packages/${id}`);
        return response.data;
    }
};
