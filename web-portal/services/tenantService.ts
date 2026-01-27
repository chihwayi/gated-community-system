import api from './api';

export interface Tenant {
    id: number;
    name: string;
    slug: string;
    logo_url?: string;
    primary_color?: string;
    accent_color?: string;
}

export const tenantService = {
    getTenantBySlug: async (slug: string): Promise<Tenant> => {
        const response = await api.get<Tenant>(`/tenants/by-slug/${slug}`);
        return response.data;
    },
};
