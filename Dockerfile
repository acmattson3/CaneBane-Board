# Multi-stage build for CaneBane Board
FROM node:18-bullseye AS build

# Set working directory
WORKDIR /app

# Copy source
COPY . .

# Install server dependencies
WORKDIR /app/server
RUN npm ci

# Install client dependencies and build
WORKDIR /app/client
RUN npm ci \
    && npm run build

# Production image
FROM node:18-bullseye
WORKDIR /app

# Copy server and built client from build stage
COPY --from=build /app/server /app/server
COPY --from=build /app/client/build /app/server/public

# Install only production dependencies in server
WORKDIR /app/server
RUN npm prune --omit=dev

# Expose port and start server
EXPOSE 5000
CMD ["npm", "start"]
