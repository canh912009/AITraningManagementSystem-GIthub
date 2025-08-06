FROM node:20-alpine AS base

# Cài đặt OpenSSL và các thư viện cần thiết cho Prisma
RUN apk add --no-cache openssl libc6-compat

# Cài đặt dependencies chỉ khi cần thiết
FROM base AS deps
WORKDIR /app

# Copy package.json và package-lock.json
COPY package.json package-lock.json* ./

# Cài đặt dependencies
RUN npm ci --only=production

# Build source code chỉ khi cần thiết
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build ứng dụng
RUN npm run build

# Production image, copy tất cả files và chạy next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Cài đặt OpenSSL và các thư viện cần thiết cho Prisma ở production stage
RUN apk add --no-cache openssl libc6-compat

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set quyền đúng cho prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prisma schema and node_modules for prisma client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Create uploads directory
RUN mkdir -p uploads
RUN chown nextjs:nodejs uploads

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]