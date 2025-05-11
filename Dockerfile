# ---------- 1) Build Frontend ---------- 
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------- 2) Build & Run Backend ---------- 
FROM node:18-alpine AS backend-runtime
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./

# Copy static frontend assets
COPY --from=frontend-build /app/frontend/build/ ./public/

EXPOSE 3000
CMD ["node", "server.js"]
