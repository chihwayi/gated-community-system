import api from './api';

export interface Tenant {
    id: number;
    name: string;
    slug: string;
    domain?: string;
    is_active: boolean;
    logo_url?: string;
    primary_color?: string;
    accent_color?: string;
    created_at?: string;
    updated_at?: string;
}

export interface TenantCreate {
    name: string;
    slug: string;
    domain?: string;
    admin_email: string;
    admin_password: string;
    admin_name: string;
    is_active?: boolean;
}

export interface TenantUpdate {
    name?: string;
    slug?: string;
    domain?: string;
    is_active?: boolean;
    logo_url?: string;
    primary_color?: string;
    accent_color?: string;
}

export const tenantService = {
    getTenantBySlug: async (slug: string): Promise<Tenant> => {
        const response = await api.get<Tenant>(`/tenants/by-slug/${slug}`);
        return response.data;
    },

    // Super Admin methods
    getAllTenants: async (skip = 0, limit = 100): Promise<Tenant[]> => {
        const response = await api.get<Tenant[]>(`/tenants/?skip=${skip}&limit=${limit}`);
        return response.data;
    },

    createTenant: async (data: TenantCreate): Promise<Tenant> => {
        const response = await api.post<Tenant>('/tenants/', data);
        return response.data;
    },

    updateTenant: async (id: number, data: TenantUpdate): Promise<Tenant> => {
        const response = await api.put<Tenant>(`/tenants/${id}`, data);
        return response.data;
    },

    deleteTenant: async (id: number): Promise<Tenant> => {
        const response = await api.delete<Tenant>(`/tenants/${id}`);
        return response.data;
    }
};
