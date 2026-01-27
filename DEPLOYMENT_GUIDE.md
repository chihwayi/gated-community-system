# Deployment Guide (Remote Server & Multi-Tenancy)

This document describes how to deploy the Gated Community System to a remote server (VPS or Cloud) with multi-tenancy support and no CORS issues.

## Architecture

- **Nginx (Reverse Proxy)**: Listens on port 80/443. Routes traffic to Frontend and Backend. Handles CORS by serving everything from the same origin.
- **Web Portal (Next.js)**: Runs on port 3000 (internal).
- **Backend (FastAPI)**: Runs on port 8000 (internal).
- **PostgreSQL**: Database.
- **Minio**: Object storage.

## Multi-Tenancy Access

The system supports multi-tenancy via subdomains or query parameters.

### Option 1: Subdomains (Recommended)
If you have a domain (e.g., `mycommunity.com`) and wildcard DNS setup (`*.mycommunity.com` -> Server IP):
- `tenant1.mycommunity.com` -> Loads Tenant 1 branding
- `tenant2.mycommunity.com` -> Loads Tenant 2 branding

### Option 2: IP-Based / Query Parameter (Testing/Simple Setup)
If you only have an IP address (e.g., `173.212.195.88`):
- `http://173.212.195.88/?tenant=tenant1` -> Loads Tenant 1 branding
- `http://173.212.195.88/?tenant=tenant2` -> Loads Tenant 2 branding

## Remote Server Deployment Steps

### 1. Prerequisites
- A remote server (Ubuntu/Debian recommended) with public IP.
- Docker and Docker Compose installed.
- Git installed.

### 2. Clone Repository
```bash
git clone https://github.com/chihwayi/gated-community-system.git
cd gated-community-system
```

### 3. Configure Environment
Create a `.env` file from the example:

```bash
cp .env.example .env
nano .env
```

**Crucial Settings for Remote Server:**
- `DOMAIN`: Set to your server's Public IP or Domain Name.
- `NEXT_PUBLIC_API_URL`: `http://<YOUR_IP_OR_DOMAIN>/api/v1` (Note: No port 8000, goes through Nginx).
- `BACKEND_CORS_ORIGINS`: `["http://<YOUR_IP_OR_DOMAIN>"]` (Allowed origin is now the Nginx entry point).
- `MINIO_ENDPOINT`: `<YOUR_IP_OR_DOMAIN>:9000` (or proxy via Nginx if configured).

Example `.env` for IP `173.212.195.88`:
```env
DOMAIN=173.212.195.88
NEXT_PUBLIC_API_URL=http://173.212.195.88/api/v1
BACKEND_CORS_ORIGINS=["http://173.212.195.88"]
MINIO_ENDPOINT=173.212.195.88:9000
```

### 4. Start Services
```bash
docker-compose up -d --build
```

### 5. Verify Deployment
- **Frontend**: Visit `http://<YOUR_IP>`
- **Backend API**: Visit `http://<YOUR_IP>/api/v1/health` or `http://<YOUR_IP>/docs`
- **Tenant Check**: Visit `http://<YOUR_IP>/?tenant=default` (or any slug you created).

## Initial Setup & Super Admin

1. **Seed Data**: The system initializes with default data.
2. **Create Super Admin**:
   Access the database or use the initial seed credentials (usually `admin@example.com` / `changethis`).
3. **Create Tenants**:
   Use the Super Admin API (via Swagger UI at `/docs`) to create new tenants.
   - Endpoint: `POST /api/v1/tenants/`
   - Body: `{"name": "Sunset Villas", "slug": "sunset", "logo_url": "..."}`

## Production Considerations

- **SSL/HTTPS**: For production, update `nginx/nginx.conf` to handle SSL certificates (Let's Encrypt via Certbot recommended) and listen on 443.
- **Security**: Change default passwords in `.env`.
- **Backups**: Backup `postgres_data` and `minio_data` volumes regularly.
