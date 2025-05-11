# ---------- 1) Build Frontend (Debian-based) ----------
FROM node:14-alpine AS frontend-build

WORKDIR /app/frontend

# Install Alpine build tools needed by many JS toolchains
RUN apk add --no-cache \
    build-base python3

# Copy only package files and install deps
COPY frontend/package*.json ./
RUN npm ci

# Copy the rest of your frontend code and build
COPY frontend/ ./
RUN npm run build   # now should succeed

# ---------- 2) Build & Run Backend ----------
FROM node:18-bullseye AS backend-runtime

WORKDIR /app

# Production-only backend deps
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY backend/ ./

# Copy built frontend into backend’s public folder
COPY --from=frontend-build /app/frontend/dist ./public/

EXPOSE 3000
CMD ["node", "server.js"]
