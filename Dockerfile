# Use the official Node.js LTS image as the base
FROM node:22.8.0

# Set working directory
WORKDIR /app

# Copy package.json and lock files
COPY package.json ./

# Install production dependencies
RUN npm install

# Copy the rest of the source code
COPY . .


# Expose the service's port
EXPOSE 4001
# Start the application
CMD ["npm", "run", "start"]

