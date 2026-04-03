#!/bin/bash
# Test script to verify all systems are working

echo "=========================================="
echo "Whiteboard Project - System Check"
echo "=========================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  Node.js: $NODE_VERSION"
else
    echo "  ✗ Node.js not found!"
fi

# Check npm
echo ""
echo "✓ Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "  npm: $NPM_VERSION"
else
    echo "  ✗ npm not found!"
fi

# Check MongoDB
echo ""
echo "✓ Checking MongoDB..."
if command -v mongod &> /dev/null; then
    MONGO_VERSION=$(mongod --version 2>&1 | head -1)
    echo "  MongoDB: $MONGO_VERSION"
else
    echo "  ⚠ MongoDB not found in PATH (may still be installed)"
fi

# Check folder structure
echo ""
echo "✓ Checking project structure..."
if [ -d "backend" ] && [ -d "frontend" ]; then
    echo "  ✓ backend/ folder found"
    echo "  ✓ frontend/ folder found"
else
    echo "  ✗ backend/ or frontend/ folder missing!"
fi

# Check backend dependencies
echo ""
echo "✓ Checking backend dependencies..."
if [ -d "backend/node_modules" ]; then
    echo "  ✓ Backend packages installed"
else
    echo "  ⚠ Backend packages not installed. Run: cd backend && npm install"
fi

# Check frontend dependencies
echo ""
echo "✓ Checking frontend dependencies..."
if [ -d "frontend/node_modules" ]; then
    echo "  ✓ Frontend packages installed"
else
    echo "  ⚠ Frontend packages not installed. Run: cd frontend && npm install"
fi

# Check .env files
echo ""
echo "✓ Checking configuration files..."
if [ -f "backend/.env" ]; then
    echo "  ✓ backend/.env found"
else
    echo "  ⚠ backend/.env not found"
fi

if [ -f "frontend/.env" ]; then
    echo "  ✓ frontend/.env found"
else
    echo "  ⚠ frontend/.env not found"
fi

echo ""
echo "=========================================="
echo "System check complete!"
echo "=========================================="
echo ""
echo "To start the project:"
echo "1. Open Terminal 1: mongod"
echo "2. Open Terminal 2: cd backend && npm start"
echo "3. Open Terminal 3: cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
