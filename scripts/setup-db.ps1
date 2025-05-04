# Local database setup script for Windows
# This script sets up a local PostgreSQL database using Docker

# Check if Docker is installed
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker is not installed. Please install Docker Desktop for Windows first."
    exit 1
}

# Check if PostgreSQL container exists
$containerExists = docker ps -a -q -f name=aicha-postgres
if ($containerExists) {
    Write-Host "PostgreSQL container already exists."
    $containerRunning = docker ps -q -f name=aicha-postgres
    if ($containerRunning) {
        Write-Host "PostgreSQL container is already running."
    } else {
        Write-Host "Starting existing container..."
        docker start aicha-postgres
    }
} else {
    Write-Host "Creating new PostgreSQL container..."
    docker run --name aicha-postgres `
        -e POSTGRES_PASSWORD="$env:SUPABASE_DB_PASSWORD" `
        -e POSTGRES_DB="$env:SUPABASE_DB_NAME" `
        -p "$env:SUPABASE_DB_PORT:5432" `
        -d postgres:15
}

Write-Host "Waiting for PostgreSQL to be ready..."
Start-Sleep -Seconds 5

# Create database and tables
Write-Host "Creating database schema..."
$env:PGPASSWORD = $env:SUPABASE_DB_PASSWORD
psql -h localhost -p $env:SUPABASE_DB_PORT -U postgres -d $env:SUPABASE_DB_NAME -f ../supabase/schema.sql

Write-Host "Database setup completed successfully!"
Write-Host "Host: localhost"
Write-Host "Port: $env:SUPABASE_DB_PORT"
Write-Host "Database: $env:SUPABASE_DB_NAME"
Write-Host "User: postgres"
Write-Host "Password: $env:SUPABASE_DB_PASSWORD" 