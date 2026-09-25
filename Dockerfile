# Multi-stage Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and service manifests
COPY package.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN cd backend && npm ci || npm install
RUN cd frontend && npm ci || npm install

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build frontend static bundle
RUN cd frontend && npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 5001

CMD ["node", "backend/server.js"]
