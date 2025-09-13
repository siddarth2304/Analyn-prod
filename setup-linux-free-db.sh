#!/bin/bash

echo "🚀 Setting up ANALYN Platform on Linux..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔧 Creating .env.local file..."
    cp .env.example .env.local
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    sed -i "s/your-super-secret-jwt-key-here/$JWT_SECRET/g" .env.local
    
    echo "✅ Environment file created with secure JWT secret"
fi

# Create database directory
mkdir -p database

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Run: npm run setup-sqlite"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000"
echo ""
echo "🧪 Test accounts:"
echo "Admin: admin@analyn.com / password123"
echo "Therapist: maria.santos@analyn.com / password123"
