#!/bin/bash

# Gated Community System - Deployment Script
# Usage: ./deploy.sh [SERVER_IP] [SSH_USER] [SSH_PORT]
# Example: ./deploy.sh 173.212.195.88 root 22

set -e

SERVER_IP=${1:-"173.212.195.88"}
SSH_USER=${2:-"root"}
SSH_PORT=${3:-"22"}
PROJECT_DIR="/root/gated-community-system"
REPO_URL="https://github.com/chihwayi/gated-community-system.git"
TAG="v1.0.0-single-tenant"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[DEPLOY]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if sshpass is installed (optional but helpful for password auth)
if ! command -v sshpass &> /dev/null; then
    warn "sshpass is not installed. You will be prompted for the password multiple times."
    warn "To install on Mac: brew install sshpass"
    warn "To install on Ubuntu: apt-get install sshpass"
fi

log "Deploying to ${SSH_USER}@${SERVER_IP}..."

# Define the remote script
REMOTE_SCRIPT="
set -e

# Function to log on server
log() {
    echo -e \"\\033[0;32m[SERVER]\\033[0m \$1\"
}

# 1. Clone or Update Repo
if [ -d \"$PROJECT_DIR\" ]; then
    log \"Updating existing repository...\"
    cd \"$PROJECT_DIR\"
    git fetch --all
    git checkout tags/$TAG || git checkout $TAG
    git pull origin $TAG
else
    log \"Cloning repository...\"
    git clone \"$REPO_URL\" \"$PROJECT_DIR\"
    cd \"$PROJECT_DIR\"
    git checkout tags/$TAG || git checkout $TAG
fi

# 2. Configure Environment
log \"Configuring environment...\"
if [ ! -f .env ]; then
    log \"Creating .env file...\"
    cp .env.example .env
    
    # Set production ports
    sed -i 's/NGINX_PORT=80/NGINX_PORT=8080/g' .env
    sed -i 's/MINIO_API_PORT=9000/MINIO_API_PORT=9005/g' .env
    sed -i 's/MINIO_CONSOLE_PORT=9001/MINIO_CONSOLE_PORT=9006/g' .env
    
    # Set API URL for frontend
    sed -i 's|NEXT_PUBLIC_API_URL=/api/v1|NEXT_PUBLIC_API_URL=http://$SERVER_IP:8080/api/v1|g' .env
    
    # Set CORS
    sed -i \"s|BACKEND_CORS_ORIGINS=.*|BACKEND_CORS_ORIGINS=[\\\"http://localhost:3000\\\", \\\"http://localhost:8080\\\", \\\"http://$SERVER_IP:8080\\\"]|g\" .env
fi

# 3. Start Services
log \"Starting Docker services...\"
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans

# 4. Wait for Database
log \"Waiting for database to be ready...\"
sleep 10

# 5. Run Migrations
log \"Running database migrations...\"
docker compose -f docker-compose.prod.yml exec -T backend alembic upgrade head

# 6. Seed Data (Optional but recommended for fresh install)
log \"Seeding initial data (Admin, Guard, Resident)...\"
docker compose -f docker-compose.prod.yml exec -T backend python backend/reset_admin.py
docker compose -f docker-compose.prod.yml exec -T backend python backend/create_dummy_users.py

log \"Deployment Complete!\"
log \"----------------------------------------\"
log \"Dashboard: http://$SERVER_IP:8080/default/login\"
log \"Admin:     admin@example.com / admin123\"
log \"Guard:     guard@example.com / guard123\"
log \"Resident:  resident@example.com / resident123\"
log \"----------------------------------------\"
"

# Execute remote script
ssh -o StrictHostKeyChecking=no -p "$SSH_PORT" "${SSH_USER}@${SERVER_IP}" "bash -s" <<< "$REMOTE_SCRIPT"

log "Done!"
