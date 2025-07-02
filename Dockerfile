FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json ./
# Generate package-lock.json if it doesn't exist
RUN npm install --package-lock-only --legacy-peer-deps
# Install dependencies
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
RUN npm run build

# Production image with embedded SQLite
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 1468

# Install SQLite
RUN apk add --no-cache sqlite

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create data directory for SQLite
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy database initialization script
COPY --chown=nextjs:nodejs scripts/init-sqlite.sql ./scripts/

USER nextjs

EXPOSE 1468

ENV HOSTNAME "0.0.0.0"

# Initialize SQLite database and start the application
CMD ["sh", "-c", "sqlite3 /app/data/recovery.db < /app/scripts/init-sqlite.sql 2>/dev/null || true && node server.js"]
