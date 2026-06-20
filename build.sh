#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Building CivicConnect AI..."

# 1. Build the React Frontend
echo ">>> Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# 2. Install Python Backend Dependencies
echo ">>> Installing Backend Dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "Build complete!"
