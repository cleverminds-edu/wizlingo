# Build stage
FROM node:20.9.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Production stage
FROM node:20.9.0-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy Prisma schema and migrations
COPY --chown=nextjs:nodejs prisma ./prisma/

# Copy .next from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Copy public assets
COPY --chown=nextjs:nodejs public ./public

# Copy other necessary files
COPY --chown=nextjs:nodejs next.config.ts ./
COPY --chown=nextjs:nodejs tsconfig.json ./

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node_modules/.bin/next", "start"]
