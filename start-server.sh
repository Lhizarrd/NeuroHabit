#!/bin/bash
# NeuroHabit Auto-Startup for Linux/Mac
# Add this to your cron or startup script

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting NeuroHabit Server..."

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Please install Node.js first."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env template..."
    cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
PORT=3000
HOSTNAME=localhost
EOF
    echo ".env created. Please fill in your OPENAI_API_KEY!"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the server
npm start

# If server exits
echo "Server stopped"
