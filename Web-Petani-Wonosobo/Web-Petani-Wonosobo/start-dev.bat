@echo off
echo 🚀 Starting Web Petani Wonosobo Development Server

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python tidak terinstall. Silakan install Python terlebih dahulu.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js tidak terinstall. Silakan install Node.js terlebih dahulu.
    pause
    exit /b 1
)

REM Navigate to backend directory
cd backend

echo 📦 Installing Python dependencies...
pip install -r requirements.txt

echo 🔧 Starting FastAPI Backend Server...
REM Start backend server in background
start "Backend Server" python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

REM Wait a few seconds for backend to start
timeout /t 5 /nobreak >nul

REM Navigate back to root for frontend
cd ..

echo 🌐 Starting Vite Frontend Server...
REM Start frontend server
start "Frontend Server" npm run dev

echo ✅ Servers started successfully!
echo 🖥️  Frontend: http://localhost:5173
echo 🔗 Backend API: http://localhost:8000  
echo 📚 API Documentation: http://localhost:8000/docs
echo.
echo Press any key to close this window (servers will continue running)...
pause >nul