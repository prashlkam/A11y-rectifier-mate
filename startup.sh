#!/bin/bash

# Azure App Service Linux Startup Script
# This script is used to start the application on Azure App Service

echo "Starting application on Azure App Service..."

# Set the path for Playwright browsers (Azure App Service persistent storage)
export PLAYWRIGHT_BROWSERS_PATH=0
export PLAYWRIGHT_CHROMIUM_USE_HEADLESS_NEW=1

# Use the bundled Chromium that comes with the node_modules
# This avoids needing system dependencies

# Start the application
cd /home/site/wwwroot
npm start
