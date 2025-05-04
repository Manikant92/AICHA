#!/bin/bash

# Database setup script for AICHA
# This script sets up either a local PostgreSQL database or a cloud database using Supabase

# Check if running locally or in cloud
if [ "$1" == "local" ]; then
    echo "Setting up local PostgreSQL database..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if PostgreSQL container exists
    if [ "$(docker ps -a -q -f name=aicha-postgres)" ]; then
        echo "PostgreSQL container already exists."
        if [ "$(docker ps -q -f name=aicha-postgres)" ]; then
            echo "PostgreSQL container is already running."
        else
            echo "Starting existing container..."
            docker start aicha-postgres
        fi
    else
        echo "Creating new PostgreSQL container..."
        docker run --name aicha-postgres \
            -e POSTGRES_PASSWORD="${SUPABASE_DB_PASSWORD}" \
            -e POSTGRES_DB="${SUPABASE_DB_NAME}" \
            -p "${SUPABASE_DB_PORT}:5432" \
            -d postgres:15
    fi
    
    # Wait for PostgreSQL to be ready
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
    
    # Create database and tables
    echo "Creating database schema..."
    PGPASSWORD="${SUPABASE_DB_PASSWORD}" psql -h localhost -p "${SUPABASE_DB_PORT}" -U postgres -d "${SUPABASE_DB_NAME}" -f ../supabase/schema.sql
    
    echo "Database setup completed successfully!"
    echo "Host: localhost"
    echo "Port: ${SUPABASE_DB_PORT}"
    echo "Database: ${SUPABASE_DB_NAME}"
    echo "User: postgres"
    echo "Password: ${SUPABASE_DB_PASSWORD}"
    
else
    echo "Setting up cloud PostgreSQL database using Supabase..."
    # Cloud setup logic here
fi

echo "AICHA Database Setup"
echo "-------------------"
echo "1. Setup local PostgreSQL database"
echo "2. Setup cloud PostgreSQL database (Supabase)"
echo "Usage: ./setup-db.sh [local|cloud]" 