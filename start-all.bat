@echo off
echo Starting MongoDB...
start mongod

echo Waiting for MongoDB to start...
timeout /t 3

echo Starting Backend Server...
start cmd /k "cd backend && npm start"

echo Waiting for Backend to start...
timeout /t 3

echo Starting Frontend Dev Server...
start cmd /k "cd frontend && npm run dev"

echo.
echo.
echo =========================================
echo All servers are starting!
echo =========================================
echo Backend: http://localhost:5003
echo Frontend: http://localhost:5173
echo.
echo Login with test credentials or register a new account.
echo.
pause
