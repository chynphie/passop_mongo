# 1. Frontend build (unchanged)
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json .  
RUN npm ci
COPY frontend/ .  
RUN npm run build

# 2. Backend build with Python deps
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
RUN apk add --no-cache \
    python3 \
    py3-pip \
    python3-dev \
    build-base \
    libffi-dev \
    openssl-dev
COPY backend/requirements.txt .
RUN pip3 install --upgrade pip \
    && pip3 install --no-cache-dir -r requirements.txt
COPY backend/ .  
RUN npm ci && npm run build

# 3. Production image
FROM node:18-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
USER app
COPY --from=frontend-builder /app/frontend/build ./public
COPY --from=backend-builder /app/backend/dist ./api
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD curl --fail http://localhost:3000/health || exit 1
CMD ["node", "api/server.js"]
