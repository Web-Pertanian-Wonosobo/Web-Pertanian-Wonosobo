#!/bin/bash

echo "🚀 Starting Web Petani Wonosobo Development Server"

# Cek apakah Python dan Node.js terinstall
command -v python >/dev/null 2>&1 || { echo "❌ Python tidak terinstall. Silakan install Python terlebih dahulu." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js tidak terinstall. Silakan install Node.js terlebih dahulu." >&2; exit 1; }

# Navigasi ke direktori backend
cd backend

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "🔧 Starting FastAPI Backend Server..."
# Start backend server in background
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Tunggu beberapa detik untuk backend start
sleep 5

# Navigasi ke direktori root untuk frontend
cd ..

echo "🌐 Starting Vite Frontend Server..."
# Start frontend server
npm run dev &
FRONTEND_PID=$!

echo "✅ Servers started successfully!"
echo "🖥️  Frontend: http://localhost:5173"
echo "🔗 Backend API: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

# Setup trap for cleanup
trap cleanup INT

# Wait for user input
wait