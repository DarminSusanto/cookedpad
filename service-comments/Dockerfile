FROM node:18-alpine

WORKDIR /app

# 1. Copy package files
COPY package*.json ./

# 2. Install PRODUCTION dependencies only (mengurangi ukuran image)
RUN npm ci --only=production

# 3. Copy source code
COPY . .

# 4. Create non-root user untuk keamanan
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 5. Set ownership
RUN chown -R nodejs:nodejs /app

# 6. Switch to non-root user
USER nodejs

# 7. Health check untuk Kubernetes
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 8. Expose port (pastikan sesuai dengan port di index.js)
EXPOSE 3000

# 9. Start application
CMD ["node", "index.js"]