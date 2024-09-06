# Stage 1: Build the React app
FROM node:18-alpine AS build

# Set environment to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy client package files
COPY client/package*.json ./client/

# Move to client directory
WORKDIR /app/client

# Install dependencies
RUN npm install

# Copy the React app files
COPY ./client .

# Build the React app
RUN npm run build

# Stage 2: Set up the server and serve the React build
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Move to server directory
WORKDIR /app/server

# Install server dependencies
RUN npm install

# Move back to /app to place the React build outside server directory
WORKDIR /app

# Copy the built React app from the previous build stage to /app/client/build
COPY --from=build /app/client/build ./client/build

# Move back to server directory for server operations
WORKDIR /app/server

# Copy the rest of the server files to the container
COPY ./server .

# Expose the port the server will run on
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
