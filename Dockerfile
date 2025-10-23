
# Dockerfile

# Start with a base image that includes a package manager (like Debian/Ubuntu for apt)
# We'll use a Node.js base image directly to get Node.js pre-installed efficiently.
# This image is based on Debian, so we can use apt-get for Chromium.
FROM node:24

# Set a working directory (optional, but good practice)
WORKDIR /app

# Install Chromium and its dependencies
# The '--no-install-recommends' helps keep the image smaller by avoiding unnecessary packages.
# The 'rm -rf /var/lib/apt/lists/*' cleans up apt cache to further reduce image size.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    chromium \
    # Chromium often needs these for headless mode, especially in containers
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    # Clean up
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# You can add other configurations here if needed,
# e.g., COPY package.json .
# RUN npm install
