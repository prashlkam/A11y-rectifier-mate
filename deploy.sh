#!/bin/bash

# Azure App Service Deployment Script for Linux
# This runs after Oryx build completes

echo "Post-build script starting..."

# Install Playwright Chromium browser only (no system deps)
# System deps can't be installed on Azure App Service without custom image
echo "Installing Playwright Chromium browser..."
npx playwright install chromium

# Set environment variable to use bundled Chromium
export PLAYWRIGHT_BROWSERS_PATH=0

echo "Post-build script completed."
