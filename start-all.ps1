# PowerShell script to start all servers
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Starting Whiteboard Project..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Start MongoDB
Write-Host "Starting MongoDB..." -ForegroundColor Yellow
Start-Process mongod

Write-Host "Waiting 3 seconds for MongoDB to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Backend
Write-Host "Starting Backend Server on port 5003..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start"

Write-Host "Waiting 3 seconds for Backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend Dev Server on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "All servers are starting!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5003" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open the frontend URL in your browser and enjoy!" -ForegroundColor Green
Write-Host ""
