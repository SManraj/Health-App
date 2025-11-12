# Use Node.js LTS version
FROM node:18-alpine

# Install Expo CLI globally
RUN npm install -g expo-cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose ports for Expo
# 19000 - Expo DevTools
# 19001 - Expo DevTools (secure)
# 19002 - Metro Bundler
EXPOSE 19000 19001 19002

# Set environment variable to allow connections from any host
ENV REACT_NATIVE_PACKAGER_HOSTNAME="0.0.0.0"

# Start Expo
CMD ["npx", "expo", "start", "--web"]
