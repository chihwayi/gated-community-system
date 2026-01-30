# Single-Tenant Deployment Guide (v1.0.0)

This guide describes how to deploy the **Single-Tenant** version of the Gated Community System to any Linux server (VPS or Cloud).

## Quick Start (Automated Deployment)

We have provided a unified deployment script `deploy.sh` that automates the entire process.

### Prerequisites
*   A clean Linux server (Ubuntu 20.04/22.04/24.04 recommended).
*   Root or sudo access via SSH.
*   Public IP address of the server.

### Deploying to a Remote Server

Run this command from your **local machine** (replace placeholders with your actual details):

```bash
./deploy.sh <SERVER_IP> <SSH_USER> <SSH_PORT>
```

**Example:**
```bash
./deploy.sh 173.212.195.88 root 22
```

### What the Script Does
1.  **Clones/Updates Repository**: Fetches the specific `v1.0.0-single-tenant` tag.
2.  **Configures Environment**:
    *   Creates `.env` file automatically.
    *   Sets up production ports to avoid conflicts (Frontend: `8080`, Minio: `9005`/`9006`).
    *   Configures API URLs and CORS for the specific server IP.
3.  **Starts Services**: Launches Backend, Frontend, Database, and Minio using Docker Compose.
4.  **Runs Migrations**: Applies all database schema changes.
5.  **Seeds Data**:
    *   Resets Admin credentials.
    *   Creates dummy Guard and Resident accounts for testing.

---

## Accessing the System

After the script completes, you can access the system immediately:

| Portal | URL | Credentials (Email / Password) |
| :--- | :--- | :--- |
| **Admin Dashboard** | `http://<SERVER_IP>:8080/default/login` | `admin@example.com` / `admin123` |
| **Guard Portal** | `http://<SERVER_IP>:8080/default/login` | `guard@example.com` / `guard123` |
| **Resident Portal** | `http://<SERVER_IP>:8080/default/login` | `resident@example.com` / `resident123` |

*Replace `<SERVER_IP>` with your actual server IP address.*

---

## Manual Deployment (If Script Fails)

If you prefer to deploy manually on the server:

1.  **SSH into Server**:
    ```bash
    ssh root@<SERVER_IP>
    ```

2.  **Clone Repository**:
    ```bash
    git clone https://github.com/chihwayi/gated-community-system.git
    cd gated-community-system
    git checkout v1.0.0-single-tenant
    ```

3.  **Setup Environment**:
    ```bash
    cp .env.example .env
    # Edit .env to set DOMAIN=<SERVER_IP>, NGINX_PORT=8080, etc.
    ```

4.  **Start Docker**:
    ```bash
    docker compose -f docker-compose.prod.yml up -d --build
    ```

5.  **Run Migrations & Seed**:
    ```bash
    docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
    docker compose -f docker-compose.prod.yml exec backend python backend/reset_admin.py
    docker compose -f docker-compose.prod.yml exec backend python backend/create_dummy_users.py
    ```

---

## Troubleshooting

*   **500 Internal Server Error**: Check backend logs:
    ```bash
    docker compose -f docker-compose.prod.yml logs --tail=100 backend
    ```
*   **Port Conflicts**: The script defaults to port `8080` for the web interface to avoid conflicts with existing services on port `80`. Ensure firewall allows traffic on port `8080`.
