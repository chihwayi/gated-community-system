#! /usr/bin/env bash
set -e

# Run migrations
echo "Running migrations..."
python3 -m alembic upgrade head

# Create initial data
echo "Creating initial data..."
python3 initial_data.py

# Start application
echo "Starting application..."
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
