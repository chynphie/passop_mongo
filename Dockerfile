# 1. Build Stage for React Frontend
FROM node:18-alpine AS frontend-builder  
WORKDIR /app/frontend  
COPY frontend/package*.json ./  
RUN npm ci --legacy-peer-deps  
COPY frontend/ .  
RUN npm run build  

# 2. Build Stage for Backend (Express + Python)
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend

# 1. Install Python, pip, and build deps
RUN apk add --no-cache \
    python3 \
    py3-pip \
    python3-dev \
    build-base \
    libffi-dev \
    openssl-dev

# 2. Upgrade pip and install Python packages
COPY backend/requirements.txt .
RUN pip3 install --upgrade pip \
    && pip3 install --no-cache-dir -r requirements.txt

# 3. Copy the rest of your backend code
COPY backend/ .  
RUN npm ci && npm run build


# 3. Final Production Image
FROM node:18-alpine  
WORKDIR /app  
# Non-root user
RUN addgroup -S app && adduser -S app -G app  
USER app  
# Copy built artifacts
COPY --from=frontend-builder /app/frontend/build ./public  
COPY --from=backend-builder /app/backend/dist ./  
# Environment variables (injected at CI/CD runtime)
ENV NODE_ENV=production  
EXPOSE 3000  
# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s CMD curl --fail http://localhost:3000/health || exit 1  
CMD ["node", "server.js"]
