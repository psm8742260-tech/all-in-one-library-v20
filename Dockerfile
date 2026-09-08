# ==========================================
# Multi-stage Dockerfile for All In One Library
# Full-Stack React (Vite) + Node/Express Application
# ==========================================

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for Docker caching
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Build the client and server bundle
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy built assets and compiled server from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Expose container port
EXPOSE 8080

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/api/health || exit 1

# Start the application
CMD ["node", "dist/server.cjs"]
