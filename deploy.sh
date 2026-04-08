#!/bin/bash

# Azure App Service Deployment Script for Linux

# Install Playwright dependencies (browsers and system deps)
echo "Installing Playwright browsers..."
npx playwright install chromium

echo "Installing Playwright system dependencies..."
npx playwright install-deps chromium

# Build the application
echo "Building application..."
npm run build

# Start the application
echo "Starting application..."
npm start
