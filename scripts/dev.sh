#!/bin/bash
set -e

echo "🚀 Starting Content Archive development environment..."

# Start PostgreSQL if not running
if ! pg_isready -q 2>/dev/null; then
    echo "📦 Starting PostgreSQL..."
    sudo service postgresql start
fi

# Start AI service in background
echo "🤖 Starting AI service..."
cd services/ai
source venv/bin/activate 2>/dev/null || true
uvicorn src.main:app --reload --port 8000 &
AI_PID=$!
cd ../..

# Start web app
echo "🌐 Starting web app..."
npm run dev &
WEB_PID=$!

echo ""
echo "✅ Services started:"
echo "  Web app:    http://localhost:3000"
echo "  AI service: http://localhost:8000"
echo "  API docs:   http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Handle shutdown
trap "kill $AI_PID $WEB_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
