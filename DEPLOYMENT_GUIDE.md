# Deployment Guide (Client Testing and Staging)

This document describes how to run the signed-out system for client demos and testing while development continues. It covers local staging, Docker-based deployment, and tenant branding setup.

## Prerequisites

- Docker and Docker Compose
- Environment variables set for backend and web portal
- Minio running with accessible bucket and presigned URL support

## Clone and Checkout Stable Release

```bash
git clone https://github.com/chihwayi/gated-community-system.git
cd gated-community-system
git checkout v1.0.0-single-tenant
```

## Start Services

```bash
docker-compose up -d --build
```

Services:
- Backend API: http://localhost:8000
- Web Portal: http://localhost:3000
- Minio: http://localhost:9000

## Environment Configuration

Backend configuration: [config.py](file:///Users/devoop/Dev/personal/gated%20community/gated-community-system/backend/app/core/config.py)
- Set CORS origins to include the web portal host
- Configure Minio credentials and bucket

Web portal configuration:
- Next.js environment via `.env.local` (not committed)
- API base URL pointing to backend (http://localhost:8000)

## Seeding Data

The system automatically runs migrations and seeds initial data (default admin user) on startup via the `start.sh` script.

To reset or re-seed manually:

```bash
docker exec -it backend bash -lc "python initial_data.py"
```

## Media Storage Setup

- Ensure `uploads` bucket exists and has read policy
- URL generation handled by: [storage.py](file:///Users/devoop/Dev/personal/gated%20community/gated-community-system/backend/app/core/storage.py)

## Creating a Demo Admin

- Use the login page at http://localhost:3000/login
- If no admin exists, create via API or seed scripts

## Branding a Tenant (Preview)

For multi-tenant previews, configure tenant branding (logo/color) using placeholder data until the private Super Admin portal is available:
- Upload a logo via the resident Settings page (Minio-backed)
- Apply colors via CSS variables or theme config in [globals.css](file:///Users/devoop/Dev/personal/gated%20community/gated-community-system/web-portal/app/globals.css) and [Providers.tsx](file:///Users/devoop/Dev/personal/gated%20community/gated-community-system/web-portal/components/Providers.tsx)

## Payments (Demo Mode)

- The financial module supports payment recording and verification
- Per-tenant payment gateway keys will be managed in the private control plane
- In demos, simulate payment verification via admin panel

## Production Notes

- Use HTTPS for both API and web portal
- Configure environment variables securely via your orchestration platform
- Set proper CORS, CSRF protections, and session timeouts
- Keep Super Admin portal private and on a restricted domain

## Troubleshooting

- CORS errors: verify backend origins in config
- Image access: ensure Minio bucket policy allows public reads
- Presigned URL failures: check host:port in Minio and reverse proxy settings

## References

- Backend API docs: http://localhost:8000/docs
- Compose file: [docker-compose.yml](file:///Users/devoop/Dev/personal/gated%20community/gated-community-system/docker-compose.yml)
- Storage: [storage.py](file:///Users/devoop/Dev/personal/gated%20community/gated-community-system/backend/app/core/storage.py)

