@echo off
echo Starting Oud Restaurant Services...
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run server"

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Starting Admin Panel...
start "Admin" cmd /k "cd admin && npm run dev"

echo.
echo All services are starting...
echo Backend: http://localhost:4000
echo Frontend: http://localhost:5173
echo Admin: http://localhost:3000
echo.
pause
