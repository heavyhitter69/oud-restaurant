Write-Host "Starting Oud Restaurant Services..." -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run server"

# Wait a moment
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"

# Wait a moment
Start-Sleep -Seconds 2

# Start Admin
Write-Host "Starting Admin Panel..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\admin'; npm run dev"

Write-Host ""
Write-Host "All services are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:4000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Admin: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this script..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
