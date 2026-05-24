#!/bin/bash
set -e

echo "🚀 Setting up Content Archive..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required"; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "⚠️  PostgreSQL client not found. Make sure PostgreSQL is running."; }

# Setup environment
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file — please edit with your configuration"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup Prisma
echo "🗄️  Setting up database..."
npx prisma generate
npx prisma db push
echo "🌱 Seeding database..."
npm run prisma:seed

# Setup AI service
echo "🐍 Setting up AI service..."
cd services/ai
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
cd ../..

echo "✅ Setup complete!"
echo ""
echo "To start the app:"
echo "  1. Terminal 1: cd services/ai && uvicorn src.main:app --reload --port 8000"
echo "  2. Terminal 2: npm run dev"
echo ""
echo "Or with Docker: docker-compose up -d"
