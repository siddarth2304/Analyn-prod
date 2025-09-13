#!/bin/bash

echo "🚀 Setting up ANALYN Platform with Neon Database..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi

# Copy environment file
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "📝 Created .env.local file"
    echo "⚠️  Please update .env.local with your Neon database URL and other secrets"
else
    echo "✅ .env.local already exists"
fi

# Generate JWT secret if not exists
if ! grep -q "JWT_SECRET=" .env.local || grep -q "your-32-character-secure-secret-key-here" .env.local; then
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i "s/your-32-character-secure-secret-key-here/$JWT_SECRET/" .env.local
    echo "🔐 Generated JWT secret"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create a free Neon database at https://neon.tech"
echo "2. Copy your connection string to DATABASE_URL in .env.local"
echo "3. Run the SQL scripts in Neon's SQL Editor:"
echo "   - scripts/001-initial-schema.sql"
echo "   - scripts/002-seed-data.sql"
echo "4. Start development: npm run dev"
echo ""
echo "🧪 Test accounts will be created:"
echo "   Admin: admin@analyn.com / password123"
echo "   Therapist: maria.santos@analyn.com / password123"
echo ""
echo "🌐 Visit http://localhost:3000 when ready!"
