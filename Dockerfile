# =============================================
# AI Execution Dashboard - Production Dockerfile
# =============================================
# Multi-stage build for Next.js standalone output
# Optimized for Railway deployment

# =============================================
# Stage 1: Dependencies
# =============================================
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# =============================================
# Stage 2: Builder
# =============================================
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate build
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# =============================================
# Stage 3: Runner
# =============================================
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output from builder
# The standalone output has a nested .next directory structure
COPY --from=builder /app/.next/standalone ./
# Copy static assets from the nested .next/static directory to .next/static
COPY --from=builder /app/.next/standalone/.next/static ./.next/static

# Copy public assets
COPY --from=builder /app/public ./public

# Set ownership for security
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port (Railway will inject PORT env var)
EXPOSE 3000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "server.js"]
