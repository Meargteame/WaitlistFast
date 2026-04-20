#!/bin/bash

echo "🚀 Starting WaitlistFast..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from example..."
    cp .env.example .env.local
    echo "✓ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: Add your Gemini API key to .env.local"
    echo "   Get one at: https://aistudio.google.com/app/apikey"
    echo ""
    exit 1
fi

# Check if database exists
if [ ! -f waitlist.db ]; then
    echo "📦 Database not found. Running seed..."
    npm run seed
    echo ""
fi

echo "🔥 Starting development servers..."
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo ""

npm run dev:all
