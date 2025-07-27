#!/bin/bash

# Kill any process running on port 3000
echo "Killing any process on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait a moment for the port to be freed
sleep 2

# Check if port 3000 is free
if lsof -i :3000 >/dev/null 2>&1; then
    echo "Port 3000 is still in use. Please check manually."
    exit 1
fi

echo "Port 3000 is free. Starting frontend..."
cd frontend && npm start 