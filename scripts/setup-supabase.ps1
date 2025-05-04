# Supabase setup script for Windows

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed. Please install Node.js first."
    exit 1
}

# Check if Supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Supabase CLI..."
    npm install -g supabase
}

# Initialize Supabase project
Write-Host "Initializing Supabase project..."
supabase init

# Start Supabase services
Write-Host "Starting Supabase services..."
supabase start

# Get connection details
Write-Host "Getting connection details..."
$supabaseStatus = supabase status
$supabaseUrl = ($supabaseStatus | Select-String "API URL").Line.Split(":")[1].Trim()
$anonKey = ($supabaseStatus | Select-String "anon key").Line.Split(":")[1].Trim()
$serviceKey = ($supabaseStatus | Select-String "service_role key").Line.Split(":")[1].Trim()

# Create .env file with Supabase credentials
Write-Host "Creating .env file..."
@"
SUPABASE_URL=$supabaseUrl
SUPABASE_ANON_KEY=$anonKey
SUPABASE_SERVICE_KEY=$serviceKey
SUPABASE_USER=postgres
SUPABASE_PASSWORD=postgres
SUPABASE_HOST=localhost
SUPABASE_PORT=5432
SUPABASE_DB=postgres
"@ | Out-File -FilePath "../backend/.env" -Encoding utf8

# Apply migrations
Write-Host "Applying database migrations..."
supabase db push

Write-Host "Supabase setup completed successfully!"
Write-Host "Connection details have been saved to backend/.env"
Write-Host "You can now start your application with these credentials." 