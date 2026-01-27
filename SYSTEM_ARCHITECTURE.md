# System Architecture and SaaS Plan

This document defines the terminology, architecture, stages, and sprints for evolving the Gated Community System into a secure, multi-tenant SaaS while preserving a public codebase and a private Super Admin control plane.

## Terminology

- Tenant: A gated community (e.g., Sunrise Estate)
- Super Admin: You, operating the private control plane
- Tenant Admin: Admin user within a tenant
- Resident: Household account belonging to a tenant
- Guard: Security personnel account belonging to a tenant
- Subscription: Limits and plan assigned to a tenant (admins/guards/households)
- Branding: Logo, colors, and theme per tenant

## Architecture Overview

- Model: Shared database with row-level isolation using `tenant_id`
- Isolation: FastAPI dependencies enforce tenant scoping on every request
- Routing: Subdomains (e.g., sunrise.yourdomain.com) resolve the active tenant
- Branding: Tenant config (logo URL, colors) loaded at runtime for theming
- Payments: Per-tenant gateway credentials and settlement
- Control Plane: Private Super Admin portal (separate repository) manages tenants, subscriptions, and billing

## Data Model Changes

- Add `tenant_id` to all domain tables
- Create `tenants` table:
  - id, name, slug
  - logo_url, primary_color, accent_color
  - payment_gateway_config (provider, keys)
  - subscription_limits (max_admins, max_guards, max_households)
  - status (active/suspended)

## API Separation and Security

- Tenant resolution middleware:
  - Derive tenant by subdomain or explicit header
  - Attach `current_tenant` to request context
- Query scoping:
  - All CRUD operations filter by `tenant_id`
- Role-based access:
  - Roles: super_admin, tenant_admin, resident, guard
  - Super admin endpoints only available to private control plane
- Payment isolation:
  - Each transaction uses the current tenant’s payment credentials

## Branding and UX Strategy

- On bootstrap, frontend requests `/api/tenants/by-slug/:slug`
- Apply `logo_url` and colors via ThemeProvider
- Cache config client-side; refresh on tenant change

## Sprints and Stages

Stage 1: Foundation
- Create `tenants` model and migration
- Add `tenant_id` to all models
- Seed initial tenant and admin

Stage 2: Isolation
- Implement tenant resolution dependency
- Enforce query scoping by `tenant_id`
- RBAC updates for tenant roles

Stage 3: Control Plane
- Private Super Admin portal (new repo)
- Tenant CRUD, subscription limits, billing hooks
- Suspend/reactivate tenants

Stage 4: Branding and Payments
- Per-tenant branding config and file upload
- Payment gateway provider abstraction with per-tenant credentials

Stage 5: Observability and Reporting
- Usage metrics per tenant
- Admin and Super Admin reports

## Non-Shared Data Principles

- No cross-tenant reads or writes
- Per-tenant payment keys never reused
- Media assets stored with keys that include tenant scope
- Backups and restores performed per tenant when needed

## Deployment and Environments

- Public app (this repo): tenant-facing experiences
- Private control plane: super admin-only, separate deployment with restricted access
- Shared services: Minio, DB, message queue (optional)

## References

- Backend API: [api.py](file:///Users/devoop/Dev/personal/gated%20community/gated-community-system/backend/app/api/api.py)
- Tenant branding integration points:
  - Frontend Providers: [Providers.tsx](file:///Users/devoop/Dev/personal/gated%20community/gated-community-system/web-portal/components/Providers.tsx)
  - Contexts: [ToastContext.tsx](file:///Users/devoop/Dev/personal/gated%20community/gated-community-system/web-portal/context/ToastContext.tsx), [ConfirmationContext.tsx](file:///Users/devoop/Dev/personal/gated%20community/gated-community-system/web-portal/context/ConfirmationContext.tsx)

