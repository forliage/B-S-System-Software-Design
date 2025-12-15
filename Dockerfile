# Build stage for Frontend
FROM node:18 AS builder

WORKDIR /app

# Copy package files for caching
COPY package*.json ./

# Install dependencies (will only install if there's a package.json in root, but we usually have separate ones)
# Ideally we should copy frontend package.json first.
# Let's adjust to be robust:

COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

COPY frontend/ ./
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copy Backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

COPY backend/ ./

# Copy Frontend Build
COPY --from=builder /app/frontend/build /app/frontend/build

# Environment
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
