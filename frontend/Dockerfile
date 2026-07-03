# ─────────────────────────────────────────────
# Stage 1 — Build
# ─────────────────────────────────────────────
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json package-lock.json* ./

# Install all dependencies (including devDeps needed for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2 — Serve with Nginx
# ─────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
