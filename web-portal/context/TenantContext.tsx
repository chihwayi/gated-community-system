"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant, tenantService } from '@/services/tenantService';
import { useParams, useSearchParams } from 'next/navigation';

interface TenantContextType {
    tenant: Tenant | null;
    isLoading: boolean;
    error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode; slug?: string }> = ({ children, slug: propSlug }) => {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const searchParams = useSearchParams();

    useEffect(() => {
        let isMounted = true;
        const fetchTenant = async () => {
            try {
                let slug = propSlug;

                if (!slug) {
                    // 1. Try path param
                    if (params?.tenant) {
                        slug = params.tenant as string;
                    }
                    
                    // 2. Try query param
                    if (!slug) {
                         const querySlug = searchParams.get('tenant');
                         if (querySlug) slug = querySlug;
                    }

                    // 3. Try subdomain
                    if (!slug) {
                        const hostname = window.location.hostname;
                        const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
                        if (hostname !== 'localhost' && !isIP) {
                            const parts = hostname.split('.');
                            if (parts.length > 2) {
                                slug = parts[0];
                            }
                        }
                    }

                    // 4. Default
                    if (!slug) {
                        slug = 'default';
                    }
                }

                console.log(`Resolving tenant for slug: ${slug}`);
                const data = await tenantService.getTenantBySlug(slug);
                
                if (isMounted) {
                    setTenant(data);
                    
                    // Apply branding colors if available
                    if (data.primary_color) {
                        document.documentElement.style.setProperty('--primary-brand', data.primary_color);
                    }
                    if (data.accent_color) {
                        document.documentElement.style.setProperty('--accent-brand', data.accent_color);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch tenant:", err);
                if (isMounted) {
                    setError("Tenant not found");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchTenant();
        
        return () => {
            isMounted = false;
        };
    }, [propSlug, params?.tenant, searchParams]);

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
