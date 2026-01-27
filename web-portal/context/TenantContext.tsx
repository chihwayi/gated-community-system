"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant, tenantService } from '@/services/tenantService';

interface TenantContextType {
    tenant: Tenant | null;
    isLoading: boolean;
    error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                // Determine slug from subdomain
                let slug = 'default'; // Fallback for localhost
                const hostname = window.location.hostname;
                const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
                
                // If not localhost and not IP, try to get subdomain
                if (hostname !== 'localhost' && !isIP) {
                    const parts = hostname.split('.');
                    // e.g. tenant.domain.com -> parts[0] is tenant
                    // e.g. domain.com -> no subdomain
                    if (parts.length > 2) {
                        slug = parts[0];
                    }
                }
                
                // Allow override via query param ?tenant=slug
                const urlParams = new URLSearchParams(window.location.search);
                const querySlug = urlParams.get('tenant');
                if (querySlug) {
                    slug = querySlug;
                }

                console.log(`Resolving tenant for slug: ${slug}`);
                const data = await tenantService.getTenantBySlug(slug);
                setTenant(data);
                
                // Apply branding colors if available
                if (data.primary_color) {
                    document.documentElement.style.setProperty('--primary-brand', data.primary_color);
                }
                if (data.accent_color) {
                    document.documentElement.style.setProperty('--accent-brand', data.accent_color);
                }
            } catch (err) {
                console.error("Failed to fetch tenant:", err);
                setError("Tenant not found");
                // Fallback to a default or show error?
                // For now, keep tenant null, UI can handle it.
            } finally {
                setIsLoading(false);
            }
        };

        fetchTenant();
    }, []);

    return (
        <TenantContext.Provider value={{ tenant, isLoading, error }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};
