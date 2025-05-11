# ---------- 1) Build Frontend ----------
FROM node:18-slim AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./

RUN npm run build   # now uses Debian toolchain, won’t choke on Vite plugins

# ---------- 2) Build & Run Backend ----------
FROM node:18-slim AS backend-runtime
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./public/

EXPOSE 3000
CMD ["node", "server.js"]