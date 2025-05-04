#!/bin/bash

# Supabase setup script for AICHA

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Supabase CLI is installed
if ! command_exists supabase; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

# Initialize Supabase project
echo "Initializing Supabase project..."
supabase init

# Start Supabase services
echo "Starting Supabase services..."
supabase start

# Get connection details
echo "Getting connection details..."
SUPABASE_URL=$(supabase status | grep "API URL" | awk '{print $3}')
SUPABASE_ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')
SUPABASE_SERVICE_KEY=$(supabase status | grep "service_role key" | awk '{print $3}')

# Create .env file with Supabase credentials
echo "Creating .env file..."
cat > ../backend/.env << EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
SUPABASE_USER=postgres
SUPABASE_PASSWORD=postgres
SUPABASE_HOST=localhost
SUPABASE_PORT=5432
SUPABASE_DB=postgres
EOF

# Apply migrations
echo "Applying database migrations..."
supabase db push

echo "Supabase setup completed successfully!"
echo "Connection details have been saved to backend/.env"
echo "You can now start your application with these credentials." 