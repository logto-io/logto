#!/bin/bash

# Reset the test database to a clean state
# This script completely recreates the PostgreSQL container and seeds it with test data

set -e

echo "🔄 Resetting test database..."

# Database connection details
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="p0stgr3s"
DB_NAME="logto_test"

# Stop and remove PostgreSQL container completely
echo "🛑 Stopping and removing PostgreSQL container..."
docker stop logto-postgres-dev || true
docker rm logto-postgres-dev || true

# Start fresh PostgreSQL container
echo "🚀 Starting fresh PostgreSQL container..."
docker run -d --name logto-postgres-dev -p 5432:5432 \
  -e POSTGRES_USER=$DB_USER \
  -e POSTGRES_PASSWORD=$DB_PASSWORD \
  -e POSTGRES_DB=$DB_NAME \
  postgres:17-alpine

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5
until docker exec logto-postgres-dev pg_isready -U $DB_USER; do
  echo "PostgreSQL is not ready yet, waiting..."
  sleep 2
done

echo "🌱 Seeding database with test data..."
# Seed with test data (run from root directory)
cd ../..
DB_URL="postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" pnpm cli db seed --test

echo "✅ Database reset complete!"
