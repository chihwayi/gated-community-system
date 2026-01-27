import api from './api';

export interface Tenant {
    id: number;
    name: string;
    slug: string;
    domain?: string;
    is_active: boolean;
    plan?: string;
    subscription_end_date?: string;
    logo_url?: string;
    primary_color?: string;
    accent_color?: string;
    max_admins?: number;
    max_guards?: number;
    max_residents?: number;
    package_id?: number;
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
    plan?: string;
    subscription_end_date?: string;
    max_admins?: number;
    max_guards?: number;
    max_residents?: number;
    package_id?: number;
    logo_url?: string;
    primary_color?: string;
    accent_color?: string;
}

export interface TenantUpdate {
    name?: string;
    slug?: string;
    domain?: string;
    is_active?: boolean;
    plan?: string;
    subscription_end_date?: string;
    logo_url?: string;
    primary_color?: string;
    accent_color?: string;
    max_admins?: number;
    max_guards?: number;
    max_residents?: number;
    package_id?: number;
}

export interface TenantUsage {
    plan: string;
    limits: {
        max_admins: number;
        max_guards: number;
        max_residents: number;
    };
    usage: {
        admins: number;
        guards: number;
        residents: number;
    };
}

export const tenantService = {
    getTenantBySlug: async (slug: string): Promise<Tenant> => {
        const response = await api.get<Tenant>(`/tenants/by-slug/${slug}`);
        return response.data;
    },

    getTenantUsage: async (): Promise<TenantUsage> => {
        const response = await api.get<TenantUsage>('/tenants/me/usage');
        return response.data;
    },

    // Super Admin methods
    getPlatformStats: async (): Promise<{ total_tenants: number; active_tenants: number; total_users: number }> => {
        const response = await api.get<{ total_tenants: number; active_tenants: number; total_users: number }>('/tenants/stats');
        return response.data;
    },

    getPublicTenants: async (skip = 0, limit = 100): Promise<Tenant[]> => {
        const response = await api.get<Tenant[]>(`/tenants/public?skip=${skip}&limit=${limit}`);
        return response.data;
    },

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
