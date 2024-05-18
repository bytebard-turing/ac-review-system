# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package*.json pnpm-lock.yaml ./

# Install application dependencies
RUN pnpm install --frozen-lockfile


# This is our secret sauce
RUN git clone https://github.com/vishnubob/wait-for-it.git
RUN ls .
# Copy the entire application code to the working directory
COPY . .

# Expose the port on which the application will run
EXPOSE 8080

# Define the command to run the application
# CMD ["pnpm", "start:dev"]
