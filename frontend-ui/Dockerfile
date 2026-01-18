# Stage 1: Build React Application
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Copy dependency files
COPY package*.json ./

# 2. Install all dependencies (including dev dependencies for build)
RUN npm ci

# 3. Copy source code
COPY . .

# 4. Build with production environment variables
ARG REACT_APP_API_AUTH=http://localhost:3001
ARG REACT_APP_API_USERS=http://localhost:3002
ARG REACT_APP_API_RECIPES=http://localhost:3003
ARG REACT_APP_API_COMMENTS=http://localhost:3004

ENV REACT_APP_API_AUTH=${REACT_APP_API_AUTH}
ENV REACT_APP_API_USERS=${REACT_APP_API_USERS}
ENV REACT_APP_API_RECIPES=${REACT_APP_API_RECIPES}
ENV REACT_APP_API_COMMENTS=${REACT_APP_API_COMMENTS}

RUN npm run build

# Stage 2: Production Server
FROM nginx:alpine

# 1. Remove default nginx configuration
RUN rm -rf /etc/nginx/conf.d/*

# 2. Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# 3. Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# 4. Health check (untuk Kubernetes)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 5. Expose port
EXPOSE 80

# 6. Start nginx
CMD ["nginx", "-g", "daemon off;"]