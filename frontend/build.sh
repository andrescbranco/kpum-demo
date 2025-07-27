#!/bin/sh

# Set default environment variables for the build
export REACT_APP_API_URL=${REACT_APP_API_URL:-https://kpum-demo-1.onrender.com}
export REACT_APP_WS_URL=${REACT_APP_WS_URL:-wss://kpum-demo-1.onrender.com/ws}
export REACT_APP_ENV=${REACT_APP_ENV:-production}

echo "Building with environment variables:"
echo "REACT_APP_API_URL: $REACT_APP_API_URL"
echo "REACT_APP_WS_URL: $REACT_APP_WS_URL"
echo "REACT_APP_ENV: $REACT_APP_ENV"

# Build the React app
npm run build 