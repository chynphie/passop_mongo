# ---------- 1) Build Frontend ----------
FROM node:18-alpine AS frontend-build

# Set working directory inside the container for frontend
WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy all frontend source code and build
COPY frontend/ ./
RUN npm run build   # Make sure "build" script exists in frontend/package.json

# ---------- 2) Build & Run Backend ----------
FROM node:18-alpine AS backend-runtime

# Set working directory inside the container for backend
WORKDIR /app

# Install backend dependencies (production only)
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source code
COPY backend/ ./

# Copy static frontend assets into backend's public/ directory
COPY --from=frontend-build /app/frontend/build/ ./public/

# Expose backend port
EXPOSE 3000

# Run backend server
CMD ["node", "server.js"]
