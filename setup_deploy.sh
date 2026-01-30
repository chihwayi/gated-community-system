#!/bin/bash
set -e

# 1. Update and Install Dependencies
echo "Installing dependencies..."
# Check if docker is installed
if ! command -v docker &> /dev/null; then
    apt-get update
    apt-get install -y docker.io git
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    apt-get install -y docker-compose
fi

# 2. Clone Repository
echo "Cloning repository..."
if [ -d "gated-community-system" ]; then
    cd gated-community-system
    git fetch origin v1.0.0-single-tenant
    git checkout v1.0.0-single-tenant
    git reset --hard origin/v1.0.0-single-tenant
else
    git clone -b v1.0.0-single-tenant https://github.com/chihwayi/gated-community-system.git
    cd gated-community-system
fi

# 3. Setup .env
echo "Configuring .env..."
cat > .env <<EOF
DOMAIN=173.212.195.88
NEXT_PUBLIC_API_URL=http://173.212.195.88/api/v1
BACKEND_CORS_ORIGINS=["http://173.212.195.88"]
MINIO_ENDPOINT=173.212.195.88:9000
MINIO_PUBLIC_ENDPOINT=173.212.195.88:9000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=gated_community_db
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
NGINX_PORT=80
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001
EOF

# 4. Start Services
echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "Deployment complete! Visit http://173.212.195.88"
