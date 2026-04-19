#!/bin/bash
# Clean deployment script for Azure App Service

echo "Cleaning previous build artifacts..."
rm -rf node_modules dist
rm -f package-lock.json

echo "Installing fresh dependencies..."
npm install

echo "Building application..."
npm run build

echo "Deployment build complete!"
