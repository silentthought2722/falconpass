FROM node:18-alpine

WORKDIR /app

# Install dependencies for argon2 and sodium-native
RUN apk add --no-cache python3 make g++ git

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]