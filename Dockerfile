FROM node:18-alpine

WORKDIR /app

# Install Docker and Docker Compose
RUN apk add --no-cache docker docker-compose

# Copy the entire project
COPY . .

# Make scripts executable
RUN chmod +x deploy.sh health-check.sh

# Expose ports
EXPOSE 3000 8000 5432

# Start the deployment
CMD ["./deploy.sh"] 