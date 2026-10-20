# Stage 1: Build Expo Web Application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Export static web bundle to /app/dist
RUN npx expo export --platform web

# Stage 2: Production Nginx Server
FROM nginx:alpine

# Copy built static assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with client routing & API reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
