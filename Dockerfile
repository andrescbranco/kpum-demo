# Main Dockerfile for Render deployment
# This serves both frontend and backend in a single container

FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl python3 py3-pip nginx

# Copy package files
COPY frontend/package*.json ./frontend/
COPY backend/requirements.txt ./backend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci --only=production

# Install backend dependencies in virtual environment
WORKDIR /app/backend
RUN python3 -m venv venv && \
    . venv/bin/activate && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Create nginx configuration
RUN echo 'server { \
    listen 80; \
    server_name _; \
    \
    # Serve frontend static files \
    location / { \
        root /app/frontend/build; \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Proxy API requests to backend \
    location /api/ { \
        proxy_pass http://localhost:8000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    \
    # Proxy WebSocket connections \
    location /ws { \
        proxy_pass http://localhost:8000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    \
    # Health check endpoint \
    location /health { \
        return 200 "healthy"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/http.d/default.conf

# Create startup script
RUN echo '#!/bin/sh \n\
# Start backend in background with virtual environment \n\
cd /app/backend && . venv/bin/activate && python -m uvicorn main:app --host 0.0.0.0 --port 8000 & \n\
# Start nginx in foreground \n\
nginx -g "daemon off;"' > /app/start.sh && chmod +x /app/start.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start the application
CMD ["/app/start.sh"] 