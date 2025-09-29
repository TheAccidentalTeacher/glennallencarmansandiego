# Carmen Sandiego Game - Start Both Servers
Write-Host "🎮 Starting Carmen Sandiego Game Servers..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green

# Set location to project directory
Set-Location "C:\Users\scoso\Sourdough Pete\glennallencarmansandiego"

# Kill any existing Node processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null

# Wait a moment for cleanup
Start-Sleep 2

# Start backend server in new window
Write-Host "🚀 Starting backend server (localhost:3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'C:\Users\scoso\Sourdough Pete\glennallencarmansandiego'; Write-Host '🔥 Backend Server Starting...' -ForegroundColor Red; node test-server.mjs"

# Wait for backend to start
Start-Sleep 3

# Start frontend server in new window
Write-Host "⚡ Starting frontend server (localhost:5173)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'C:\Users\scoso\Sourdough Pete\glennallencarmansandiego'; Write-Host '🎨 Frontend Server Starting...' -ForegroundColor Blue; npm run dev"

# Wait for frontend to start
Start-Sleep 5

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Both servers should now be running!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔌 Backend:  http://localhost:3001" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "💡 If servers don't start properly, close the new windows and run this script again."
Write-Host "💡 To stop servers: Close both PowerShell windows that opened."
Write-Host ""
Write-Host "Press Enter to exit this script..."
Read-Host